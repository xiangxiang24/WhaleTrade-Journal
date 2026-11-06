import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { startTestServer } from './helpers.js';

const doc = (text: string) => JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });

describe('journal api', () => {
  let t: Awaited<ReturnType<typeof startTestServer>>;
  let alice = '';
  let bob = '';
  let noteId = 0;

  before(async () => {
    t = await startTestServer();
    alice = (await t.signUp('alice@example.com')).token;
    bob = (await t.signUp('bob@example.com')).token;
  });
  after(async () => {
    await t.close();
  });

  it('requires login', async () => {
    assert.equal((await t.api('GET', '/api/notes')).status, 401);
  });

  it('creates, reads, updates notes and validates input', async () => {
    const created = await t.api('POST', '/api/notes', { title: ' First ', content: doc('Held through the dip'), emotion: 'happy' }, alice);
    assert.equal(created.status, 201);
    assert.equal(created.json!.title, 'First');
    noteId = created.json!.id;

    assert.equal((await t.api('POST', '/api/notes', { title: '', content: doc(''), emotion: null }, alice)).status, 400); // ว่าง
    assert.equal((await t.api('POST', '/api/notes', { content: doc('x'), emotion: 'angry' }, alice)).status, 400);

    const updated = await t.api('PUT', `/api/notes/${noteId}`, { title: null, content: doc('Changed my mind'), emotion: null }, alice);
    assert.equal(updated.status, 200);
    assert.equal(updated.json!.emotion, null);
    const stored = await t.db.note.findUniqueOrThrow({ where: { id: noteId } });
    assert.equal(stored.contentText, 'Changed my mind');
    assert.ok(stored.emotionChangedAt); // อารมณ์เปลี่ยน → ตั้งเวลา

    const list = await t.api('GET', '/api/notes', undefined, alice);
    assert.equal(list.json!.length, 1);
  });

  it('keeps notes private between users', async () => {
    assert.equal((await t.api('GET', `/api/notes/${noteId}`, undefined, bob)).status, 404);
    assert.equal((await t.api('PUT', `/api/notes/${noteId}`, { content: doc('hack') }, bob)).status, 404);
    assert.equal((await t.api('DELETE', `/api/notes/${noteId}`, undefined, bob)).status, 404);
    assert.equal((await t.api('GET', '/api/notes', undefined, bob)).json!.length, 0);
  });

  it('autosaves one draft per note', async () => {
    assert.equal((await t.api('GET', `/api/notes/${noteId}/draft`, undefined, alice)).json, null);
    await t.api('PUT', `/api/notes/${noteId}/draft`, { title: 'd1', content: '', emotion: 'sad' }, alice);
    const second = await t.api('PUT', `/api/notes/${noteId}/draft`, { title: 'd2', content: doc('draft'), emotion: 'sad' }, alice);
    assert.equal(typeof second.json!.savedAt, 'number');
    const draft = await t.api('GET', `/api/notes/${noteId}/draft`, undefined, alice);
    assert.equal(draft.json!.values.title, 'd2');
    assert.equal(await t.db.noteDraft.count(), 1);
  });

  it('stores attachments as signed files and rejects bad uploads', async () => {
    const png = Buffer.from('89504e470d0a1a0a', 'hex');
    const up = await fetch(`${t.base}/api/notes/${noteId}/attachments?kind=image&name=${encodeURIComponent('chart.png')}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${alice}`, 'Content-Type': 'image/png' },
      body: png,
    });
    assert.equal(up.status, 201);
    const meta = (await up.json()) as { url: string; name: string; size: number };
    assert.equal(meta.size, png.length);
    assert.match(meta.url, /^\/api\/attachments\/\d+\/file\?sig=/);

    const file = await fetch(`${t.base}${meta.url}`);
    assert.equal(file.status, 200);
    assert.equal(file.headers.get('content-type'), 'image/png');
    assert.equal(file.headers.get('x-content-type-options'), 'nosniff');
    assert.equal((await fetch(`${t.base}${meta.url.replace(/sig=.*/, 'sig=bad')}`)).status, 404); // ลายเซ็นผิด

    const notImage = await fetch(`${t.base}/api/notes/${noteId}/attachments?kind=image&name=a.txt`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${alice}`, 'Content-Type': 'text/plain' },
      body: 'hello',
    });
    assert.equal(notImage.status, 400);
    const forBob = await fetch(`${t.base}/api/notes/${noteId}/attachments?kind=file&name=a.txt`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bob}`, 'Content-Type': 'text/plain' },
      body: 'hello',
    });
    assert.equal(forBob.status, 404);
  });

  it('moves a deleted note to the trash, then restores or purges it', async () => {
    assert.equal((await t.api('DELETE', `/api/notes/${noteId}`, undefined, alice)).status, 204);
    assert.equal(await t.db.noteDraft.count(), 0); // ลบร่างด้วย
    assert.equal((await t.api('GET', '/api/notes', undefined, alice)).json!.length, 0);
    assert.equal((await t.api('GET', `/api/notes/${noteId}`, undefined, alice)).status, 404);

    const trash = await t.api('GET', '/api/trash/notes', undefined, alice);
    assert.equal(trash.json!.length, 1);
    assert.ok(trash.json![0].deletedAt);
    assert.equal((await t.api('GET', '/api/trash/notes', undefined, bob)).json!.length, 0);
    assert.equal((await t.api('POST', `/api/trash/notes/${noteId}/restore`, undefined, bob)).status, 404);

    assert.equal((await t.api('POST', `/api/trash/notes/${noteId}/restore`, undefined, alice)).status, 200);
    assert.equal((await t.api('GET', '/api/notes', undefined, alice)).json!.length, 1);

    await t.api('DELETE', `/api/notes/${noteId}`, undefined, alice);
    const attachmentsDir = path.join(t.dataDir, 'attachments');
    assert.ok(fs.readdirSync(path.join(attachmentsDir, fs.readdirSync(attachmentsDir)[0])).length >= 1);
    assert.equal((await t.api('DELETE', `/api/trash/notes/${noteId}`, undefined, alice)).status, 204);
    assert.equal(fs.readdirSync(path.join(attachmentsDir, fs.readdirSync(attachmentsDir)[0])).length, 0); // ไฟล์ถูกลบ
    assert.equal((await t.api('GET', '/api/trash/notes', undefined, alice)).json!.length, 0);
  });

  it('exports notes as CSV with BOM, excluding the trash and neutralising formulas', async () => {
    await t.api('POST', '/api/notes', { title: '=HYPERLINK("x")', content: doc('Buy, "hold"'), emotion: 'neutral' }, alice);
    const trashed = await t.api('POST', '/api/notes', { title: 'gone', content: doc('secret'), emotion: null }, alice);
    await t.api('DELETE', `/api/notes/${trashed.json!.id}`, undefined, alice);
    const response = await fetch(`${t.base}/api/notes/export.csv`, { headers: { Authorization: `Bearer ${alice}` } });
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.deepEqual([...bytes.subarray(0, 3)], [0xef, 0xbb, 0xbf]); // BOM (fetch().text() ตัด BOM ทิ้ง จึงเช็กไบต์)
    const body = bytes.toString('utf8');
    assert.ok(body.includes("'=HYPERLINK"));
    assert.ok(body.includes('"Buy, ""hold"""'));
    assert.equal(body.includes('secret'), false);
  });
});

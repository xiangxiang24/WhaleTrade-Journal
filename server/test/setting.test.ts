import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { startTestServer } from './helpers.js';

const PNG_DATA_URL = `data:image/png;base64,${Buffer.from('89504e470d0a1a0a', 'hex').toString('base64')}`;

describe('setting api', () => {
  let t: Awaited<ReturnType<typeof startTestServer>>;
  let token = '';
  let recoveryCode = '';

  before(async () => {
    t = await startTestServer();
    ({ token, recoveryCode } = await t.signUp('thomas@example.com'));
  });
  after(async () => {
    await t.close();
  });

  it('updates the profile and serves the avatar through a signed url', async () => {
    const bad = await t.api('PATCH', '/api/account/profile', { displayName: ' ', avatarUrl: null }, token);
    assert.equal(bad.status, 400);
    const withAvatar = await t.api('PATCH', '/api/account/profile', { displayName: 'Thomas W.', avatarUrl: PNG_DATA_URL }, token);
    assert.equal(withAvatar.status, 200);
    assert.equal(withAvatar.json!.displayName, 'Thomas W.');
    const url = withAvatar.json!.avatarUrl as string;
    assert.match(url, /^\/api\/avatar\/\d+\/[\w-]+\.png\?sig=/);
    assert.equal((await fetch(`${t.base}${url}`)).status, 200);
    assert.equal((await fetch(`${t.base}${url.replace(/sig=.*/, 'sig=nope')}`)).status, 404);

    // ส่ง URL เดิมกลับมา = ไม่เปลี่ยนรูป
    assert.equal((await t.api('PATCH', '/api/account/profile', { displayName: 'Thomas W.', avatarUrl: url }, token)).json!.avatarUrl, url);
    assert.equal((await t.api('PATCH', '/api/account/profile', { displayName: 'Thomas W.', avatarUrl: 'data:text/html;base64,AAAA' }, token)).status, 400);
    assert.equal((await t.api('PATCH', '/api/account/profile', { displayName: 'Thomas W.', avatarUrl: 'https://evil.test/x.png' }, token)).status, 400);

    const removed = await t.api('PATCH', '/api/account/profile', { displayName: 'Thomas W.', avatarUrl: null }, token);
    assert.equal(removed.json!.avatarUrl, null);
    assert.equal((await fetch(`${t.base}${url}`)).status, 404); // รูปเก่าถูกลบ
  });

  it('saves language and time zone', async () => {
    const ok = await t.api('PATCH', '/api/account/preferences', { language: 'en', timezone: 'America/New_York' }, token);
    assert.equal(ok.json!.language, 'en');
    assert.equal(ok.json!.timezone, 'America/New_York');
    assert.equal((await t.api('PATCH', '/api/account/preferences', { language: 'fr', timezone: 'Asia/Bangkok' }, token)).status, 400);
    assert.equal((await t.api('PATCH', '/api/account/preferences', { language: 'th', timezone: 'Mars/Base' }, token)).status, 400);
    assert.equal((await t.api('GET', '/api/account', undefined, token)).json!.language, 'en');
  });

  it('changes the email only with the right password and a free address', async () => {
    await t.signUp('taken@example.com');
    assert.equal((await t.api('PATCH', '/api/account/email', { email: 'new@example.com', password: 'wrong' }, token)).status, 403);
    assert.equal((await t.api('PATCH', '/api/account/email', { email: 'taken@example.com', password: 'Whale1234' }, token)).status, 409);
    assert.equal((await t.api('PATCH', '/api/account/email', { email: 'thomas@example.com', password: 'Whale1234' }, token)).status, 400);
    assert.equal((await t.api('PATCH', '/api/account/email', { email: 'bad', password: 'Whale1234' }, token)).status, 400);
    const ok = await t.api('PATCH', '/api/account/email', { email: 'New@Example.com', password: 'Whale1234' }, token);
    assert.equal(ok.json!.email, 'new@example.com');
  });

  it('shows the recovery code only after confirming the password', async () => {
    assert.equal((await t.api('POST', '/api/account/recovery-code', { password: 'wrong-password' }, token)).status, 403);
    const shown = await t.api('POST', '/api/account/recovery-code', { password: 'Whale1234' }, token);
    assert.equal(shown.json!.recoveryCode, recoveryCode);
  });

  it('changes the password, rotating the token', async () => {
    assert.equal((await t.api('POST', '/api/account/password', { current: 'wrong', next: 'Brand-new-1' }, token)).status, 403);
    assert.equal((await t.api('POST', '/api/account/password', { current: 'Whale1234', next: 'short' }, token)).status, 400);
    assert.equal((await t.api('POST', '/api/account/password', { current: 'Whale1234', next: 'Whale1234' }, token)).status, 400);
    const changed = await t.api('POST', '/api/account/password', { current: 'Whale1234', next: 'Brand-new-1' }, token);
    assert.equal(changed.status, 200);
    assert.equal((await t.api('GET', '/api/account', undefined, token)).status, 401); // token เก่าใช้ไม่ได้
    token = changed.json!.token;
    assert.equal((await t.api('GET', '/api/account', undefined, token)).status, 200);
    assert.equal((await t.api('POST', '/api/auth/login', { email: 'new@example.com', password: 'Brand-new-1' })).status, 200);
  });

  it('rate limits password confirmations per user', async () => {
    let last = 0;
    for (let i = 0; i < 12; i += 1) last = (await t.api('POST', '/api/account/recovery-code', { password: 'nope-nope' }, token)).status;
    assert.equal(last, 429);
  });

  it('deletes the account with all its data and files', async () => {
    const other = (await t.signUp('other@example.com')).token;
    await t.api('PATCH', '/api/account/profile', { displayName: 'Other', avatarUrl: PNG_DATA_URL }, other);
    const note = await t.api('POST', '/api/notes', { content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'x' }] }] }) }, other);
    await t.api('POST', '/api/portfolios', { name: 'P', icon: 'leaf' }, other);
    await t.api('POST', '/api/tasks', { text: 'T' }, other);
    await fetch(`${t.base}/api/notes/${note.json!.id}/attachments?kind=file&name=a.txt`, { method: 'POST', headers: { Authorization: `Bearer ${other}`, 'Content-Type': 'text/plain' }, body: 'hello' });
    assert.ok(fs.existsSync(path.join(t.dataDir, 'avatars')));

    assert.equal((await t.api('DELETE', '/api/account', undefined, other)).status, 204);
    assert.equal((await t.api('GET', '/api/account', undefined, other)).status, 401);
    assert.equal(await t.db.user.count({ where: { email: 'other@example.com' } }), 0);
    assert.equal(await t.db.note.count(), 0);
    assert.equal(await t.db.portfolio.count(), 0);
    assert.equal(await t.db.task.count(), 0);
    assert.equal(await t.db.noteAttachment.count(), 0);
    const otherId = fs.readdirSync(path.join(t.dataDir, 'attachments')).length;
    assert.equal(otherId, 0); // โฟลเดอร์ไฟล์ของผู้ใช้ที่ลบถูกลบหมด
  });
});

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestServer } from './helpers.js';

describe('calculator, saved plans, reminders and tasks api', () => {
  let t: Awaited<ReturnType<typeof startTestServer>>;
  let alice = '';
  let bob = '';
  let scb = 0;

  before(async () => {
    t = await startTestServer();
    alice = (await t.signUp('alice@example.com')).token;
    bob = (await t.signUp('bob@example.com')).token;
    scb = (await t.api('GET', '/api/assets?q=scb', undefined, alice)).json![0].id;
  });
  after(async () => {
    await t.close();
  });

  const input = { principal: 100000, phases: [{ years: 2, monthlyDca: 5000 }, { years: 8, monthlyDca: 8000 }], avgYieldPct: 7 };

  it('calculates without touching the database', async () => {
    const { status, json } = await t.api('POST', '/api/calculator/calculate', input, alice);
    assert.equal(status, 200);
    assert.equal(json!.totalDca, 2 * 12 * 5000 + 8 * 12 * 8000);
    assert.equal(json!.totalInvested, 100000 + json!.totalDca);
    assert.equal(json!.years, 10);
    assert.ok(json!.total > json!.totalInvested);
    assert.equal(json!.phaseTotals.length, 2);
    assert.equal(await t.db.calcPlan.count(), 0);
    // ไม่มีปันผล = ได้เท่าที่ลงทุน
    assert.equal((await t.api('POST', '/api/calculator/calculate', { ...input, avgYieldPct: 0 }, alice)).json!.total, 100000 + json!.totalDca);
  });

  it('rejects invalid calculator input', async () => {
    assert.equal((await t.api('POST', '/api/calculator/calculate', { ...input, principal: -1 }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/calculator/calculate', { ...input, phases: [] }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/calculator/calculate', { ...input, phases: [{ years: 61, monthlyDca: 1 }] }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/calculator/calculate', { ...input, phases: [{ years: 40, monthlyDca: 1 }, { years: 30, monthlyDca: 1 }] }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/calculator/calculate', { ...input, avgYieldPct: 101 }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/calculator/calculate', input)).status, 401);
  });

  let planId = 0;
  it('saves a plan (recomputing the result), renames and deletes it', async () => {
    const created = await t.api('POST', '/api/plans', { name: ' Retire at 60 ', ...input, resultAmount: 1, portfolioId: null, assets: [{ assetId: scb, dividendPct: 7.1 }, { assetId: scb, dividendPct: 6.9 }] }, alice);
    assert.equal(created.status, 201);
    assert.equal(created.json!.name, 'Retire at 60');
    assert.equal(created.json!.assets[0].dividendPct, 7.1);
    const expected = (await t.api('POST', '/api/calculator/calculate', { ...input, avgYieldPct: 7 }, alice)).json!.total;
    assert.equal(created.json!.resultAmount, expected); // คำนวณใหม่ที่ server ไม่เชื่อ resultAmount ที่ส่งมา
    planId = created.json!.id;

    assert.equal((await t.api('POST', '/api/plans', { name: '', ...input, assets: [{ assetId: scb, dividendPct: 5 }] }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/plans', { name: 'x', ...input, assets: [] }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/plans', { name: 'x', ...input, assets: [{ assetId: 99999, dividendPct: 5 }] }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/plans', { name: 'x', ...input, portfolioId: 9999, assets: [{ assetId: scb, dividendPct: 5 }] }, alice)).status, 400);

    const renamed = await t.api('PATCH', `/api/plans/${planId}`, { name: 'Renamed' }, alice);
    assert.equal(renamed.json!.name, 'Renamed');
    assert.equal(renamed.json!.savedAt, created.json!.savedAt);
    assert.equal((await t.api('GET', '/api/plans', undefined, alice)).json!.length, 1);
  });

  it('keeps plans private and lists portfolio names including trashed ones', async () => {
    assert.equal((await t.api('GET', `/api/plans/${planId}`, undefined, bob)).status, 404);
    assert.equal((await t.api('PATCH', `/api/plans/${planId}`, { name: 'x' }, bob)).status, 404);
    assert.equal((await t.api('DELETE', `/api/plans/${planId}`, undefined, bob)).status, 404);
    const portfolio = (await t.api('POST', '/api/portfolios', { name: 'Mine', icon: 'leaf' }, alice)).json!.id;
    const bobsPortfolio = (await t.api('POST', '/api/portfolios', { name: 'Bobs', icon: 'leaf' }, bob)).json!.id;
    assert.equal((await t.api('POST', '/api/plans', { name: 'x', ...input, portfolioId: bobsPortfolio, assets: [{ assetId: scb, dividendPct: 5 }] }, alice)).status, 400); // ผูกกับพอร์ตคนอื่นไม่ได้
    await t.api('POST', '/api/plans', { name: 'From portfolio', ...input, portfolioId: portfolio, assets: [{ assetId: scb, dividendPct: 5 }] }, alice);
    await t.api('DELETE', `/api/portfolios/${portfolio}`, undefined, alice);
    const names = (await t.api('GET', '/api/plans/portfolio-names', undefined, alice)).json!;
    assert.deepEqual(names, [{ id: portfolio, name: 'Mine' }]);
    assert.equal((await t.api('DELETE', `/api/plans/${planId}`, undefined, alice)).status, 204);
    assert.equal((await t.api('GET', `/api/plans/${planId}`, undefined, alice)).status, 404);
  });

  let reminderId = 0;
  it('manages reminders, the due badge and the done flag', async () => {
    const past = new Date(Date.now() - 3_600_000).toISOString();
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const due = await t.api('POST', '/api/reminders', { title: 'Review dividends', description: 'Check', remindAt: past }, alice);
    assert.equal(due.status, 201);
    reminderId = due.json!.id;
    await t.api('POST', '/api/reminders', { title: 'Later', remindAt: future }, alice);
    assert.equal((await t.api('GET', '/api/reminders/due-count', undefined, alice)).json!.count, 1);
    assert.equal((await t.api('GET', '/api/reminders/due-count', undefined, bob)).json!.count, 0);

    assert.equal((await t.api('POST', '/api/reminders', { title: '', remindAt: past }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/reminders', { title: 'x', remindAt: 'tomorrow-ish' }, alice)).status, 400);

    const done = await t.api('PATCH', `/api/reminders/${reminderId}/done`, { done: true }, alice);
    assert.equal(done.json!.done, true);
    assert.ok(done.json!.doneAt);
    assert.equal((await t.api('GET', '/api/reminders/due-count', undefined, alice)).json!.count, 0);

    // เปลี่ยนเวลา = การเตือนใหม่ ยังไม่เสร็จ
    const moved = await t.api('PUT', `/api/reminders/${reminderId}`, { title: 'Review dividends', description: null, remindAt: future }, alice);
    assert.equal(moved.json!.done, false);
    assert.equal(moved.json!.doneAt, null);
    const list = (await t.api('GET', '/api/reminders', undefined, alice)).json!;
    assert.ok(list[0].remindAt <= list[1].remindAt); // เรียงตามเวลา
  });

  it('keeps reminders and tasks private', async () => {
    assert.equal((await t.api('PUT', `/api/reminders/${reminderId}`, { title: 'x', remindAt: new Date().toISOString() }, bob)).status, 404);
    assert.equal((await t.api('PATCH', `/api/reminders/${reminderId}/done`, { done: true }, bob)).status, 404);
    assert.equal((await t.api('DELETE', `/api/reminders/${reminderId}`, undefined, bob)).status, 404);
    assert.equal((await t.api('GET', '/api/reminders', undefined, bob)).json!.length, 0);
    const task = await t.api('POST', '/api/tasks', { text: 'Read the annual letter' }, alice);
    assert.equal(task.status, 201);
    assert.equal((await t.api('PATCH', `/api/tasks/${task.json!.id}`, { done: true }, bob)).status, 404);
    assert.equal((await t.api('DELETE', `/api/tasks/${task.json!.id}`, undefined, bob)).status, 404);
    assert.equal((await t.api('GET', '/api/tasks', undefined, bob)).json!.length, 0);
  });

  it('adds, edits, ticks and deletes tasks', async () => {
    const task = (await t.api('POST', '/api/tasks', { text: 'Check auto-debit' }, alice)).json!;
    assert.equal((await t.api('POST', '/api/tasks', { text: '   ' }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/tasks', { text: 'x'.repeat(201) }, alice)).status, 400);
    assert.equal((await t.api('PATCH', `/api/tasks/${task.id}`, { text: 'Check the auto-debit' }, alice)).json!.text, 'Check the auto-debit');
    assert.equal((await t.api('PATCH', `/api/tasks/${task.id}`, { done: true }, alice)).json!.done, true);
    assert.equal((await t.api('PATCH', `/api/tasks/${task.id}`, {}, alice)).status, 400);
    assert.equal((await t.api('DELETE', `/api/tasks/${task.id}`, undefined, alice)).status, 204);
    assert.equal((await t.api('GET', '/api/tasks', undefined, alice)).json!.length, 1);
  });
});

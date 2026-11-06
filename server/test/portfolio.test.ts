import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestServer } from './helpers.js';

const today = () => new Date().toISOString().slice(0, 10);
const monthsAgo = (n: number) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - n, 5)).toISOString().slice(0, 10);

describe('portfolio, transactions and trash api', () => {
  let t: Awaited<ReturnType<typeof startTestServer>>;
  let alice = '';
  let bob = '';
  let portfolioId = 0;
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

  it('serves the seeded asset list', async () => {
    const all = await t.api('GET', '/api/assets', undefined, alice);
    assert.equal(all.json!.length, 13);
    assert.equal((await t.api('GET', '/api/assets?q=apple', undefined, alice)).json![0].ticker, 'AAPL');
    assert.equal((await t.api('GET', `/api/assets?ids=${scb}`, undefined, alice)).json!.length, 1);
    assert.equal((await t.api('GET', '/api/assets')).status, 401);
  });

  it('creates a portfolio and validates the form', async () => {
    const created = await t.api('POST', '/api/portfolios', { name: 'Dividend Sanctuary', tagline: 'Anchor', description: null, icon: 'leaf', annualGoal: 250000 }, alice);
    assert.equal(created.status, 201);
    assert.equal(created.json!.annualGoal, 250000);
    assert.equal(created.json!.entries, 0);
    portfolioId = created.json!.id;
    assert.equal((await t.api('POST', '/api/portfolios', { name: ' ', icon: 'leaf' }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/portfolios', { name: 'x', icon: 'rocket' }, alice)).status, 400);
    assert.equal((await t.api('POST', '/api/portfolios', { name: 'x', icon: 'leaf', annualGoal: 0 }, alice)).status, 400);
  });

  it('records transactions and derives summaries from them', async () => {
    const buy = await t.api('POST', `/api/portfolios/${portfolioId}/transactions`, { type: 'buy', date: monthsAgo(2), assetId: scb, price: 100.25, units: 100, fee: 25, note: 'DCA' }, alice);
    assert.equal(buy.status, 201);
    assert.equal(buy.json!.price, 100.25);
    assert.equal(buy.json!.units, 100);
    const dividend = await t.api('POST', `/api/portfolios/${portfolioId}/transactions`, { type: 'dividend', date: today(), assetId: scb, amount: 1500.5, units: 100 }, alice);
    assert.equal(dividend.status, 201);
    const old = await t.api('POST', `/api/portfolios/${portfolioId}/transactions`, { type: 'dividend', date: '2020-01-01', assetId: scb, amount: 9999 }, alice);
    assert.equal(old.status, 201);

    const detail = await t.api('GET', `/api/portfolios/${portfolioId}`, undefined, alice);
    assert.equal(detail.json!.totalDca, Math.round(100.25 * 100 + 25)); // ราคา × หน่วย + ค่าธรรมเนียม
    assert.equal(detail.json!.reached, Math.round(1500.5)); // เฉพาะปันผล 12 เดือนล่าสุด
    assert.equal(detail.json!.entries, 3);

    const list = await t.api('GET', `/api/portfolios/${portfolioId}/transactions`, undefined, alice);
    assert.equal(list.json![0].date, today()); // ใหม่ → เก่า
    assert.equal((await t.api('POST', `/api/portfolios/${portfolioId}/transactions`, { type: 'buy', date: '2026-02-31', assetId: scb, price: 1, units: 1 }, alice)).status, 400);
    assert.equal((await t.api('POST', `/api/portfolios/${portfolioId}/transactions`, { type: 'buy', date: today(), assetId: 99999, price: 1, units: 1 }, alice)).status, 400);
    assert.equal((await t.api('POST', `/api/portfolios/${portfolioId}/transactions`, { type: 'buy', date: today(), assetId: scb, price: 0, units: 1 }, alice)).status, 400);

    const edited = await t.api('PUT', `/api/transactions/${buy.json!.id}`, { type: 'buy', date: monthsAgo(2), assetId: scb, price: 200, units: 100, fee: 0 }, alice);
    assert.equal(edited.status, 200);
    assert.equal((await t.api('GET', `/api/portfolios/${portfolioId}`, undefined, alice)).json!.totalDca, 20000);
    assert.equal((await t.api('DELETE', `/api/transactions/${old.json!.id}`, undefined, alice)).status, 204);
  });

  it('isolates portfolios and transactions per user', async () => {
    assert.equal((await t.api('GET', `/api/portfolios/${portfolioId}`, undefined, bob)).status, 404);
    assert.equal((await t.api('GET', `/api/portfolios/${portfolioId}/transactions`, undefined, bob)).status, 404);
    assert.equal((await t.api('POST', `/api/portfolios/${portfolioId}/transactions`, { type: 'dividend', date: today(), assetId: scb, amount: 1 }, bob)).status, 404);
    const txId = (await t.api('GET', `/api/portfolios/${portfolioId}/transactions`, undefined, alice)).json![0].id;
    assert.equal((await t.api('PUT', `/api/transactions/${txId}`, { type: 'dividend', date: today(), assetId: scb, amount: 1 }, bob)).status, 404);
    assert.equal((await t.api('DELETE', `/api/transactions/${txId}`, undefined, bob)).status, 404);
    assert.equal((await t.api('GET', '/api/portfolios', undefined, bob)).json!.length, 0);
  });

  it('exports transactions as CSV with BOM', async () => {
    const response = await fetch(`${t.base}/api/portfolios/${portfolioId}/transactions/export.csv`, { headers: { Authorization: `Bearer ${alice}` } });
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.deepEqual([...bytes.subarray(0, 3)], [0xef, 0xbb, 0xbf]); // BOM (fetch().text() ตัด BOM ทิ้ง จึงเช็กไบต์)
    const body = bytes.toString('utf8');
    assert.ok(body.startsWith('\uFEFFDate,Type,Ticker') || body.includes('Date,Type,Ticker'));
    assert.ok(body.includes('SCB'));
    assert.match(response.headers.get('content-disposition') ?? '', /Dividend-Sanctuary-transactions\.csv/);
    assert.equal((await fetch(`${t.base}/api/portfolios/${portfolioId}/transactions/export.csv`, { headers: { Authorization: `Bearer ${bob}` } })).status, 404);
  });

  it('soft deletes to the trash, keeps transactions, hides from lists and restores', async () => {
    assert.equal((await t.api('DELETE', `/api/portfolios/${portfolioId}`, undefined, alice)).status, 204);
    assert.equal((await t.api('GET', '/api/portfolios', undefined, alice)).json!.length, 0);
    assert.equal((await t.api('GET', `/api/portfolios/${portfolioId}`, undefined, alice)).status, 404);
    assert.equal((await t.api('GET', `/api/portfolios/${portfolioId}/transactions/export.csv`, undefined, alice)).status, 404);

    const trash = await t.api('GET', '/api/trash/portfolios', undefined, alice);
    assert.equal(trash.json!.length, 1);
    assert.equal(trash.json![0].entries, 2); // transaction ยังอยู่
    assert.equal((await t.api('GET', '/api/trash/portfolios', undefined, bob)).json!.length, 0);
    assert.equal((await t.api('POST', `/api/trash/portfolios/${portfolioId}/restore`, undefined, bob)).status, 404);

    assert.equal((await t.api('POST', `/api/portfolios/${portfolioId}/restore`, undefined, alice)).status, 200);
    assert.equal((await t.api('GET', `/api/portfolios/${portfolioId}`, undefined, alice)).json!.entries, 2);
  });

  it('purges a portfolio for good: transactions deleted, plans detached but kept', async () => {
    const plan = await t.db.calcPlan.create({
      data: { userId: (await t.db.user.findUniqueOrThrow({ where: { email: 'alice@example.com' } })).id, portfolioId, name: 'Plan A', principal: 0n, resultAmount: 0n, savedAt: new Date() },
    });
    await t.api('DELETE', `/api/portfolios/${portfolioId}`, undefined, alice);
    assert.equal((await t.api('GET', '/api/trash/portfolios', undefined, alice)).json![0].planCount, 1);
    assert.equal((await t.api('DELETE', `/api/trash/portfolios/${portfolioId}`, undefined, bob)).status, 404);
    assert.equal((await t.api('DELETE', `/api/trash/portfolios/${portfolioId}`, undefined, alice)).status, 204);
    assert.equal(await t.db.transaction.count(), 0);
    assert.equal((await t.db.calcPlan.findUniqueOrThrow({ where: { id: plan.id } })).portfolioId, null);
    assert.equal((await t.api('DELETE', `/api/trash/portfolios/${portfolioId}`, undefined, alice)).status, 404); // ไม่อยู่ในถังแล้ว
  });

  it('only purges what is already in the trash and empties per tab', async () => {
    const active = (await t.api('POST', '/api/portfolios', { name: 'Active', icon: 'bag' }, alice)).json!.id;
    assert.equal((await t.api('DELETE', `/api/trash/portfolios/${active}`, undefined, alice)).status, 404); // ยังไม่ได้ลบ = ลบถาวรไม่ได้
    const second = (await t.api('POST', '/api/portfolios', { name: 'Trashed', icon: 'pot' }, alice)).json!.id;
    await t.api('DELETE', `/api/portfolios/${second}`, undefined, alice);
    const emptied = await t.api('DELETE', '/api/trash/portfolios', undefined, alice);
    assert.equal(emptied.json!.deleted, 1);
    assert.equal((await t.api('GET', '/api/portfolios', undefined, alice)).json!.length, 1); // ตัวที่ active ยังอยู่
  });
});

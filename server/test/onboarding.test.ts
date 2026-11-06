import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { startTestServer } from './helpers.js';

const user = { fullName: 'Thomas Whale', displayName: 'Thomas', email: 'Thomas@Example.com', password: 'Whale1234' };

describe('auth api', () => {
  let t: Awaited<ReturnType<typeof startTestServer>>;
  let token = '';
  let recoveryCode = '';

  before(async () => {
    t = await startTestServer();
  });
  after(async () => {
    await t.close();
  });

  it('registers a user, returns token + account + recovery code, never the hash', async () => {
    const { status, json } = await t.api('POST', '/api/auth/register', user);
    assert.equal(status, 201);
    assert.match(json!.recoveryCode, /^[A-HJ-NP-Z2-9]{8}$/);
    assert.equal(json!.account.email, 'thomas@example.com');
    assert.equal(json!.account.displayName, 'Thomas');
    assert.equal(JSON.stringify(json).includes('passwordHash'), false);
    token = json!.token;
    recoveryCode = json!.recoveryCode;

    const stored = await t.db.user.findUniqueOrThrow({ where: { email: 'thomas@example.com' } });
    assert.notEqual(stored.passwordHash, user.password);
    assert.notEqual(stored.recoveryCode, recoveryCode); // เก็บแบบเข้ารหัส ไม่ใช่ข้อความจริง
  });

  it('rejects duplicate email (case-insensitive) and invalid input', async () => {
    assert.equal((await t.api('POST', '/api/auth/register', { ...user, email: 'THOMAS@example.com' })).status, 409);
    assert.equal((await t.api('POST', '/api/auth/register', { ...user, email: 'nope' })).status, 400);
    assert.equal((await t.api('POST', '/api/auth/register', { ...user, email: 'a@b.co', password: 'short' })).status, 400);
    assert.equal((await t.api('POST', '/api/auth/register', { ...user, email: 'a@b.co', fullName: ' ' })).status, 400);
  });

  it('logs in with the right password only', async () => {
    const ok = await t.api('POST', '/api/auth/login', { email: ' thomas@example.com ', password: user.password });
    assert.equal(ok.status, 200);
    assert.ok(ok.json!.token);
    const bad = await t.api('POST', '/api/auth/login', { email: 'thomas@example.com', password: 'wrong-password' });
    assert.equal(bad.status, 401);
    assert.equal(bad.json!.error, 'Incorrect email or password.');
    const unknown = await t.api('POST', '/api/auth/login', { email: 'nobody@example.com', password: 'whatever123' });
    assert.equal(unknown.json!.error, 'Incorrect email or password.'); // ไม่บอกว่าอีเมลไม่มีบัญชี
  });

  it('protects /me with the token', async () => {
    assert.equal((await t.api('GET', '/api/auth/me')).status, 401);
    assert.equal((await t.api('GET', '/api/auth/me', undefined, 'garbage')).status, 401);
    const me = await t.api('GET', '/api/auth/me', undefined, token);
    assert.equal(me.status, 200);
    assert.equal(me.json!.email, 'thomas@example.com');
  });

  it('resets the password with the recovery code and invalidates old tokens', async () => {
    const wrong = await t.api('POST', '/api/auth/recover', { email: user.email, recoveryCode: 'ZZZZ2222', newPassword: 'NewWhale5678' });
    assert.equal(wrong.status, 401);

    const messy = ` ${recoveryCode.slice(0, 4).toLowerCase()}-${recoveryCode.slice(4)} `; // ตัวเล็ก + ขีดคั่น
    const ok = await t.api('POST', '/api/auth/recover', { email: user.email, recoveryCode: messy, newPassword: 'NewWhale5678' });
    assert.equal(ok.status, 204);

    assert.equal((await t.api('GET', '/api/auth/me', undefined, token)).status, 401); // token เก่าใช้ไม่ได้
    assert.equal((await t.api('POST', '/api/auth/login', { email: user.email, password: user.password })).status, 401);
    assert.equal((await t.api('POST', '/api/auth/login', { email: user.email, password: 'NewWhale5678' })).status, 200);
  });

  it('rate limits repeated failed attempts per email', async () => {
    let last = 0;
    for (let i = 0; i < 12; i += 1) {
      last = (await t.api('POST', '/api/auth/login', { email: 'brute@example.com', password: 'guess-guess' })).status;
    }
    assert.equal(last, 429);
  });
});

import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { createDb } from '../db/client.js';
import { createApp } from '../index.js';

/** เปิด server ทดสอบบนฐานข้อมูลชั่วคราว (ใช้ migration จริงทั้งชุด) คืน fetch ที่ชี้ไป server และฟังก์ชันปิด */
export async function startTestServer() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'whale-test-'));
  const dbPath = path.join(dir, 'test.db');
  execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: `file:${dbPath}` }, stdio: 'ignore' });

  const db = createDb(dbPath);
  const secrets = { jwtSecret: crypto.randomBytes(32).toString('base64'), recoveryKey: crypto.randomBytes(32) };
  const server = createApp({ db, secrets }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  async function api(method: string, route: string, body?: unknown, token?: string) {
    const response = await fetch(`${base}${route}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = response.status === 204 ? null : ((await response.json()) as Record<string, any>);
    return { status: response.status, json };
  }

  return {
    api,
    db,
    secrets,
    async close() {
      server.close();
      await db.$disconnect();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

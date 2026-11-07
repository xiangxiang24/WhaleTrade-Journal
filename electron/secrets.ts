// ESM ของ Electron ไม่ได้ export safeStorage เป็นชื่อ ต้อง import ตัวรวมแล้วดึงออกมา
import electron from 'electron';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Secrets } from '../server/context.js';

const { safeStorage } = electron;

type Stored = { jwtSecret: string; recoveryKey: string };

/**
 * ค่าลับของ server (กุญแจ JWT + กุญแจเข้ารหัสรหัสกู้คืน) สร้างสุ่มครั้งแรกที่เปิดแอป
 * เก็บเป็นไฟล์ที่เข้ารหัสด้วย Keychain ของระบบ (safeStorage) ใน userData ไม่เก็บในฐานข้อมูล
 * ถ้าระบบเข้ารหัสไม่ได้จะเก็บแบบไม่เข้ารหัสแต่จำกัดสิทธิ์ไฟล์ให้เจ้าของคนเดียว
 */
export async function loadSecrets(userDataDir: string): Promise<Secrets> {
  const file = path.join(userDataDir, 'secrets.bin');
  const encrypted = await safeStorage.isAsyncEncryptionAvailable();

  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file);
    const text = encrypted ? (await safeStorage.decryptStringAsync(raw)).result : raw.toString('utf8');
    const saved = JSON.parse(text) as Stored;
    return { jwtSecret: saved.jwtSecret, recoveryKey: Buffer.from(saved.recoveryKey, 'base64') };
  }

  const secrets: Secrets = { jwtSecret: crypto.randomBytes(48).toString('base64'), recoveryKey: crypto.randomBytes(32) };
  const text = JSON.stringify({ jwtSecret: secrets.jwtSecret, recoveryKey: secrets.recoveryKey.toString('base64') } satisfies Stored);
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.writeFileSync(file, encrypted ? await safeStorage.encryptStringAsync(text) : text, { mode: 0o600 });
  return secrets;
}

import crypto from 'node:crypto';
import type { Secrets } from '../../context.js';

// <img src> และลิงก์ดาวน์โหลดส่ง header Authorization ไม่ได้ จึงใช้ URL ที่เซ็นด้วย HMAC แทน
// ลายเซ็นผูกกับชนิด + id ของไฟล์ เดาไม่ได้ ใช้ไฟล์อื่นไม่ได้ (ไฟล์ใหม่ id ใหม่ ลายเซ็นใหม่)

function sign(secrets: Secrets, scope: string) {
  return crypto.createHmac('sha256', secrets.jwtSecret).update(`file:${scope}`).digest('base64url');
}

export function signedPath(secrets: Secrets, path: string, scope: string, query = ''): string {
  return `${path}?${query ? `${query}&` : ''}sig=${sign(secrets, scope)}`;
}

export function verifySignature(secrets: Secrets, scope: string, given: unknown): boolean {
  if (typeof given !== 'string') return false;
  const expected = Buffer.from(sign(secrets, scope));
  const actual = Buffer.from(given);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

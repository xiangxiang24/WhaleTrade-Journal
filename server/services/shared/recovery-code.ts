import crypto from 'node:crypto';

// ตัดตัวอักษรที่สับสนง่าย (0/O, 1/I) ออก รหัสกู้คืนยาว 8 ตัวอักษร เช่น "AHDB3309" ตามที่หน้าสมัครแสดง
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

export function generateRecoveryCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) code += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return code;
}

/** ผู้ใช้พิมพ์ตัวเล็ก ช่องว่าง หรือขีดคั่นได้ ปรับให้เป็นรูปเดียวกันก่อนเทียบ */
export function normalizeRecoveryCode(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase();
}

/** เข้ารหัส AES-256-GCM เก็บ iv(12) + authTag(16) + ciphertext เป็น base64 ข้อความเดียว */
export function encryptRecoveryCode(code: string, key: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(code, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64');
}

export function decryptRecoveryCode(stored: string, key: Buffer): string {
  const raw = Buffer.from(stored, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8');
}

/** เทียบแบบเวลาคงที่ (กัน timing attack) */
export function recoveryCodeMatches(stored: string, input: string, key: Buffer): boolean {
  try {
    const expected = Buffer.from(decryptRecoveryCode(stored, key));
    const given = Buffer.from(normalizeRecoveryCode(input));
    return expected.length === given.length && crypto.timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}

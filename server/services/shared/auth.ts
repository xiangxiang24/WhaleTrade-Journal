import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Secrets } from '../../context.js';
import { signedPath } from './signed-url.js';

// ส่วนที่ฟีเจอร์ onboarding (สมัคร/ล็อกอิน) และ setting-page (บัญชี) ใช้ร่วมกัน

export const BCRYPT_COST = 12;
const TOKEN_TTL = '30d';

export type UserRow = {
  id: number;
  email: string;
  fullName: string;
  displayName: string;
  avatar: string | null;
  language: string;
  timezone: string;
  tokenVersion: number;
};

/** บัญชีที่ส่งให้หน้าจอ (ตรงกับ type Account ฝั่ง frontend ไม่รวม passwordHash / recoveryCode) */
export type AccountDto = {
  fullName: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  language: 'th' | 'en';
  timezone: string;
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_COST);

/** รูปโปรไฟล์เปิดจาก <img> ได้ จึงใช้ URL เซ็นลายเซ็น ชื่อไฟล์เปลี่ยนทุกครั้งที่เปลี่ยนรูป (กัน cache เก่า) */
export function avatarUrl(secrets: Secrets, user: Pick<UserRow, 'id' | 'avatar'>): string | null {
  if (!user.avatar) return null;
  const file = user.avatar.split('/').pop() ?? '';
  return signedPath(secrets, `/api/avatar/${user.id}/${file}`, `avatar:${user.id}:${file}`);
}

export function toAccount(secrets: Secrets, user: UserRow): AccountDto {
  return {
    fullName: user.fullName,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: avatarUrl(secrets, user),
    language: user.language === 'en' ? 'en' : 'th',
    timezone: user.timezone,
  };
}

export function signToken(secrets: Secrets, user: Pick<UserRow, 'id' | 'tokenVersion'>) {
  return jwt.sign({ tv: user.tokenVersion }, secrets.jwtSecret, {
    algorithm: 'HS256',
    subject: String(user.id),
    expiresIn: TOKEN_TTL,
  });
}

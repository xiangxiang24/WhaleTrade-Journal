import type { RequestHandler } from 'express';
import { HttpError } from './http-error.js';

type Options = {
  /** จำนวนครั้งสูงสุดในหนึ่งช่วง */
  max: number;
  windowMs: number;
  /** ข้อความเมื่อเกินกำหนด */
  message: string;
};

/** จำกัดจำนวนครั้งต่อช่วงเวลา (ในหน่วยความจำ) กันเดารหัสผ่าน / รหัสกู้คืน นับตามอีเมลที่ส่งมา ไม่ตามที่อยู่เครื่อง (server ฟังเฉพาะในเครื่อง) */
export function rateLimitByEmail({ max, windowMs, message }: Options): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req, _res, next) => {
    const now = Date.now();
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const key = email || 'unknown';
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
    } else if (entry.count >= max) {
      throw new HttpError(429, message);
    } else {
      entry.count += 1;
    }
    next();
  };
}

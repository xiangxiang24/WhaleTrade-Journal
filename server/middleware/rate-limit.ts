import type { Request, RequestHandler, Response } from 'express';
import { HttpError } from './http-error.js';

type Options = {
  /** จำนวนครั้งสูงสุดในหนึ่งช่วง */
  max: number;
  windowMs: number;
  /** ข้อความเมื่อเกินกำหนด */
  message: string;
  /** ตัวแยกว่านับของใคร */
  key: (req: Request, res: Response) => string;
};

/** จำกัดจำนวนครั้งต่อช่วงเวลา (ในหน่วยความจำ) กันเดารหัสผ่าน / รหัสกู้คืน */
export function rateLimit({ max, windowMs, message, key }: Options): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req, res, next) => {
    const now = Date.now();
    const id = key(req, res);
    const entry = hits.get(id);
    if (!entry || entry.resetAt <= now) {
      hits.set(id, { count: 1, resetAt: now + windowMs });
    } else if (entry.count >= max) {
      throw new HttpError(429, message);
    } else {
      entry.count += 1;
    }
    next();
  };
}

/** นับตามอีเมลที่ส่งมา (หน้า Login / Recovery ที่ยังไม่มี token) ไม่นับตามที่อยู่เครื่อง เพราะ server ฟังเฉพาะในเครื่อง */
export const rateLimitByEmail = (options: Omit<Options, 'key'>) =>
  rateLimit({
    ...options,
    key: (req) => (typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '') || 'unknown',
  });

/** นับตามผู้ใช้ที่ล็อกอิน (ต้องอยู่หลัง requireAuth) ใช้กับการยืนยันด้วยรหัสผ่านใน Setting */
export const rateLimitByUser = (options: Omit<Options, 'key'>) =>
  rateLimit({ ...options, key: (_req, res) => `user:${String(res.locals.userId)}` });

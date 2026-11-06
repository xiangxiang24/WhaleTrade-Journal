import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import type { AppContext } from '../context.js';
import { HttpError } from './http-error.js';

const EXPIRED = 'Your session has expired. Please log in again.';

/** ตรวจ Bearer token + tokenVersion แล้วใส่ userId ไว้ที่ res.locals.userId (ทุก route ที่ต้องล็อกอินใช้ตัวนี้) */
export function requireAuth({ db, secrets }: AppContext): RequestHandler {
  return async (req, res, next) => {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new HttpError(401, EXPIRED);

    let payload: jwt.JwtPayload;
    try {
      const decoded = jwt.verify(token, secrets.jwtSecret, { algorithms: ['HS256'] });
      if (typeof decoded === 'string') throw new Error('bad payload');
      payload = decoded;
    } catch {
      throw new HttpError(401, EXPIRED);
    }

    const userId = Number(payload.sub);
    const user = Number.isInteger(userId)
      ? await db.user.findUnique({ where: { id: userId }, select: { tokenVersion: true } })
      : null;
    // เปลี่ยนรหัสผ่านแล้ว tokenVersion เพิ่ม token เก่าทุกอันใช้ไม่ได้
    if (!user || user.tokenVersion !== payload.tv) throw new HttpError(401, EXPIRED);

    res.locals.userId = userId;
    next();
  };
}

/** userId ของผู้ที่ล็อกอิน (เรียกได้เฉพาะหลัง requireAuth) */
export const currentUserId = (locals: Record<string, unknown>) => locals.userId as number;

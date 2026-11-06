import type { Request, Response } from 'express';
import type { AppContext } from '../../context.js';
import { currentUserId } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/http-error.js';
import { settingPageService } from '../../services/setting-page/setting-page.js';
import { verifySignature } from '../../services/shared/signed-url.js';
import { bodyObject, requiredText, text } from '../shared/parse.js';

// ขีดจำกัดตรงกับฟอร์มฝั่ง frontend (setting-page/types/setting.ts, auth-validation.ts)
const DISPLAY_NAME_MAX = 40;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

function validTimezone(value: unknown): string {
  const zone = typeof value === 'string' ? value : '';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    if (zone) return zone;
  } catch {
    // รหัสเขตเวลาไม่ถูกต้อง
  }
  throw new HttpError(400, 'Please choose a valid time zone.');
}

const password = (value: unknown) => (typeof value === 'string' ? value : '');

export function settingPageController(ctx: AppContext) {
  const service = settingPageService(ctx);
  const user = (res: Response) => currentUserId(res.locals);

  return {
    async get(_req: Request, res: Response) {
      res.json(await service.get(user(res)));
    },

    async updateProfile(req: Request, res: Response) {
      const body = bodyObject(req);
      const displayName = requiredText(body.displayName, DISPLAY_NAME_MAX, 'Please enter a display name.', `Keep the name within ${DISPLAY_NAME_MAX} characters.`);
      const avatar = body.avatarUrl === null || body.avatarUrl === undefined ? null : typeof body.avatarUrl === 'string' ? body.avatarUrl : '';
      res.json(await service.updateProfile(user(res), displayName, avatar));
    },

    async updatePreferences(req: Request, res: Response) {
      const body = bodyObject(req);
      if (body.language !== 'th' && body.language !== 'en') throw new HttpError(400, 'Please choose a language.');
      res.json(await service.updatePreferences(user(res), body.language, validTimezone(body.timezone)));
    },

    async updateEmail(req: Request, res: Response) {
      const body = bodyObject(req);
      const email = text(body.email);
      if (!email) throw new HttpError(400, 'Please enter your email.');
      if (email.length > 254 || !EMAIL_PATTERN.test(email)) throw new HttpError(400, 'Please enter a valid email address.');
      const current = password(body.password);
      if (!current) throw new HttpError(400, 'Enter your current password to confirm.');
      res.json(await service.updateEmail(user(res), email, current));
    },

    async changePassword(req: Request, res: Response) {
      const body = bodyObject(req);
      const current = password(body.current);
      const next = password(body.next);
      if (!current) throw new HttpError(400, 'Enter your current password.');
      if (next.length < MIN_PASSWORD_LENGTH) throw new HttpError(400, `Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      if (Buffer.byteLength(next) > MAX_PASSWORD_BYTES) throw new HttpError(400, `Password must be at most ${MAX_PASSWORD_BYTES} bytes long.`);
      res.json(await service.changePassword(user(res), current, next));
    },

    async showRecoveryCode(req: Request, res: Response) {
      const current = password(bodyObject(req).password);
      if (!current) throw new HttpError(400, 'Enter your current password to confirm.');
      res.json({ recoveryCode: await service.showRecoveryCode(user(res), current) });
    },

    async deleteAccount(_req: Request, res: Response) {
      await service.deleteAccount(user(res));
      res.status(204).end();
    },

    // GET /api/avatar/:userId/:file?sig=...  (เปิดจาก <img> ได้ ตรวจด้วยลายเซ็นแทน token)
    async readAvatar(req: Request, res: Response) {
      const userId = Number(req.params.userId);
      const file = typeof req.params.file === 'string' ? req.params.file : '';
      if (!Number.isInteger(userId) || !verifySignature(ctx.secrets, `avatar:${userId}:${file}`, req.query.sig)) {
        throw new HttpError(404, 'This file no longer exists.');
      }
      const absolute = await service.readAvatar(userId, file);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      res.type(file.endsWith('.png') ? 'image/png' : file.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
      res.sendFile(absolute);
    },
  };
}

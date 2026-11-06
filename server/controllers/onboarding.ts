import type { Request, Response } from 'express';
import type { AppContext } from '../context.js';
import { currentUserId } from '../middleware/auth.js';
import { HttpError } from '../middleware/http-error.js';
import { onboardingService } from '../services/onboarding.js';

// กติกาเดียวกับฟอร์มฝั่ง frontend (onboarding/components/auth-validation.ts)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72; // bcrypt อ่านแค่ 72 ไบต์แรก
const MAX_NAME_LENGTH = 100;

const text = (value: unknown) => (typeof value === 'string' ? value : '');

function checkEmail(email: string) {
  if (!email.trim()) throw new HttpError(400, 'Please enter your email.');
  if (email.length > 254 || !EMAIL_PATTERN.test(email.trim())) {
    throw new HttpError(400, 'Please enter a valid email address.');
  }
}

function checkNewPassword(password: string) {
  if (!password) throw new HttpError(400, 'Please enter a password.');
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (Buffer.byteLength(password) > MAX_PASSWORD_BYTES) {
    throw new HttpError(400, `Password must be at most ${MAX_PASSWORD_BYTES} bytes long.`);
  }
}

export function onboardingController(ctx: AppContext) {
  const service = onboardingService(ctx);

  return {
    async register(req: Request, res: Response) {
      const fullName = text(req.body?.fullName).trim();
      const displayName = text(req.body?.displayName).trim();
      const email = text(req.body?.email);
      const password = text(req.body?.password);
      if (!fullName) throw new HttpError(400, 'Please enter your full name.');
      if (fullName.length > MAX_NAME_LENGTH || displayName.length > MAX_NAME_LENGTH) {
        throw new HttpError(400, `Names must be at most ${MAX_NAME_LENGTH} characters.`);
      }
      checkEmail(email);
      checkNewPassword(password);
      res.status(201).json(await service.register({ fullName, displayName, email, password }));
    },

    async login(req: Request, res: Response) {
      const email = text(req.body?.email);
      const password = text(req.body?.password);
      if (!email.trim() || !password) throw new HttpError(400, 'Please enter your email and password.');
      res.json(await service.login(email, password));
    },

    async recoverPassword(req: Request, res: Response) {
      const email = text(req.body?.email);
      const recoveryCode = text(req.body?.recoveryCode);
      const newPassword = text(req.body?.newPassword);
      checkEmail(email);
      if (!recoveryCode.trim()) throw new HttpError(400, 'Please enter your recovery code.');
      checkNewPassword(newPassword);
      await service.recoverPassword(email, recoveryCode, newPassword);
      res.status(204).end();
    },

    async me(_req: Request, res: Response) {
      res.json(await service.getAccount(currentUserId(res.locals)));
    },
  };
}

import { Router } from 'express';
import type { AppContext } from '../../context.js';
import { onboardingController } from '../../controllers/onboarding/onboarding.js';
import { requireAuth } from '../../middleware/auth.js';
import { rateLimitByEmail } from '../../middleware/rate-limit.js';

const TOO_MANY = 'Too many attempts. Please wait a few minutes and try again.';

// endpoints ของฟีเจอร์: สมัครสมาชิก / ล็อกอิน / กู้รหัสผ่าน (Auth)
export function onboardingRoutes(ctx: AppContext) {
  const router = Router();
  const controller = onboardingController(ctx);
  // กันเดารหัสผ่านและรหัสกู้คืน: 10 ครั้ง / 15 นาที ต่ออีเมล
  const attempts = rateLimitByEmail({ max: 10, windowMs: 15 * 60 * 1000, message: TOO_MANY });

  router.post('/api/auth/register', controller.register);
  router.post('/api/auth/login', attempts, controller.login);
  router.post('/api/auth/recover', attempts, controller.recoverPassword);
  router.get('/api/auth/me', requireAuth(ctx), controller.me);

  return router;
}

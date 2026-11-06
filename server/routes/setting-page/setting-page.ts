import { Router } from 'express';
import type { AppContext } from '../../context.js';
import { settingPageController } from '../../controllers/setting-page/setting-page.js';
import { requireAuth } from '../../middleware/auth.js';
import { rateLimitByUser } from '../../middleware/rate-limit.js';

// endpoints ของฟีเจอร์: Setting (บัญชี ภาษา เขตเวลา ความปลอดภัย)
export function settingPageRoutes(ctx: AppContext) {
  const router = Router();
  const controller = settingPageController(ctx);
  const auth = requireAuth(ctx);
  // เรื่องที่ต้องยืนยันด้วยรหัสผ่าน: 10 ครั้ง / 15 นาที ต่อผู้ใช้ ต่อ endpoint (กัน token รั่วแล้วเดารหัสผ่าน)
  const confirmations = () =>
    rateLimitByUser({
      max: 10,
      windowMs: 15 * 60 * 1000,
      message: 'Too many attempts. Please wait a few minutes and try again.',
    });

  router.get('/api/account', auth, controller.get);
  router.patch('/api/account/profile', auth, controller.updateProfile);
  router.patch('/api/account/preferences', auth, controller.updatePreferences);
  router.patch('/api/account/email', auth, confirmations(), controller.updateEmail);
  router.post('/api/account/password', auth, confirmations(), controller.changePassword);
  router.post('/api/account/recovery-code', auth, confirmations(), controller.showRecoveryCode);
  router.delete('/api/account', auth, controller.deleteAccount);
  router.get('/api/avatar/:userId/:file', controller.readAvatar);

  return router;
}

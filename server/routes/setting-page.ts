import { Router } from 'express';
import type { AppContext } from '../context.js';
import { settingPageController } from '../controllers/setting-page.js';

// endpoints ของฟีเจอร์: บัญชี ภาษา เขตเวลา ความปลอดภัย
export function settingPageRoutes(ctx: AppContext) {
  const router = Router();
  const controller = settingPageController(ctx);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

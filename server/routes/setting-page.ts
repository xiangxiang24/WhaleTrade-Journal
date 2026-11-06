import { Router } from 'express';
import type { Db } from '../db/client.js';
import { settingPageController } from '../controllers/setting-page.js';

// endpoints ของฟีเจอร์: บัญชี ภาษา เขตเวลา ความปลอดภัย
export function settingPageRoutes(db: Db) {
  const router = Router();
  const controller = settingPageController(db);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

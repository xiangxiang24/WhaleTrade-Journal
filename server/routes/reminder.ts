import { Router } from 'express';
import type { AppContext } from '../context.js';
import { reminderController } from '../controllers/reminder.js';

// endpoints ของฟีเจอร์: การเตือน ปฏิทิน และ task
export function reminderRoutes(ctx: AppContext) {
  const router = Router();
  const controller = reminderController(ctx);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

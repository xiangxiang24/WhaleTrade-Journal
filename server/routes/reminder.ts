import { Router } from 'express';
import type { Db } from '../db/client.js';
import { reminderController } from '../controllers/reminder.js';

// endpoints ของฟีเจอร์: การเตือน ปฏิทิน และ task
export function reminderRoutes(db: Db) {
  const router = Router();
  const controller = reminderController(db);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

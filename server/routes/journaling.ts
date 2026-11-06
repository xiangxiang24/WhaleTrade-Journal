import { Router } from 'express';
import type { Db } from '../db/client.js';
import { journalingController } from '../controllers/journaling.js';

// endpoints ของฟีเจอร์: เขียน / ดู / แก้โน้ต, ฉบับร่าง, ไฟล์แนบ
export function journalingRoutes(db: Db) {
  const router = Router();
  const controller = journalingController(db);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

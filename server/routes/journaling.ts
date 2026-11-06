import { Router } from 'express';
import type { AppContext } from '../context.js';
import { journalingController } from '../controllers/journaling.js';

// endpoints ของฟีเจอร์: เขียน / ดู / แก้โน้ต, ฉบับร่าง, ไฟล์แนบ
export function journalingRoutes(ctx: AppContext) {
  const router = Router();
  const controller = journalingController(ctx);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

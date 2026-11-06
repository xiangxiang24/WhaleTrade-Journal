import { Router } from 'express';
import type { Db } from '../db/client.js';
import { savedPlanController } from '../controllers/saved-plan.js';

// endpoints ของฟีเจอร์: แผนที่บันทึกไว้
export function savedPlanRoutes(db: Db) {
  const router = Router();
  const controller = savedPlanController(db);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

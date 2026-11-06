import { Router } from 'express';
import type { AppContext } from '../context.js';
import { savedPlanController } from '../controllers/saved-plan.js';

// endpoints ของฟีเจอร์: แผนที่บันทึกไว้
export function savedPlanRoutes(ctx: AppContext) {
  const router = Router();
  const controller = savedPlanController(ctx);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

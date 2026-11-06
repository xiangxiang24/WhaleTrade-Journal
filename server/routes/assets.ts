import { Router } from 'express';
import type { AppContext } from '../context.js';
import { assetsController } from '../controllers/assets.js';

// endpoints ของฟีเจอร์: รายชื่อหุ้น/กองทุน (ใช้ร่วมกันทั้งแอป)
export function assetsRoutes(ctx: AppContext) {
  const router = Router();
  const controller = assetsController(ctx);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

import { Router } from 'express';
import type { AppContext } from '../context.js';
import { trashController } from '../controllers/trash.js';

// endpoints ของฟีเจอร์: ถังขยะของโน้ตและพอร์ต
export function trashRoutes(ctx: AppContext) {
  const router = Router();
  const controller = trashController(ctx);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

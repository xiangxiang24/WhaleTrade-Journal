import { Router } from 'express';
import type { Db } from '../db/client.js';
import { trashController } from '../controllers/trash.js';

// endpoints ของฟีเจอร์: ถังขยะของโน้ตและพอร์ต
export function trashRoutes(db: Db) {
  const router = Router();
  const controller = trashController(db);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

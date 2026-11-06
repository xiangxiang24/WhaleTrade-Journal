import { Router } from 'express';
import type { Db } from '../db/client.js';
import { portfolioController } from '../controllers/portfolio.js';

// endpoints ของฟีเจอร์: รายการพอร์ต (สร้าง / แก้ / ย้ายไปถังขยะ)
export function portfolioRoutes(db: Db) {
  const router = Router();
  const controller = portfolioController(db);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

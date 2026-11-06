import type { Db } from '../db/client.js';
import { portfolioService } from '../services/portfolio.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: รายการพอร์ต (สร้าง / แก้ / ย้ายไปถังขยะ)
export function portfolioController(db: Db) {
  const service = portfolioService(db);
  return { service };
}

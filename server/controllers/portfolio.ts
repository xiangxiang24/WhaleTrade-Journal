import type { AppContext } from '../context.js';
import { portfolioService } from '../services/portfolio.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: รายการพอร์ต (สร้าง / แก้ / ย้ายไปถังขยะ)
export function portfolioController(ctx: AppContext) {
  const service = portfolioService(ctx);
  return { service };
}

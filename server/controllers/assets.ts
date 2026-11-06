import type { AppContext } from '../context.js';
import { assetsService } from '../services/assets.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: รายชื่อหุ้น/กองทุน (ใช้ร่วมกันทั้งแอป)
export function assetsController(ctx: AppContext) {
  const service = assetsService(ctx);
  return { service };
}

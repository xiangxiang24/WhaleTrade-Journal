import type { Db } from '../db/client.js';
import { assetsService } from '../services/assets.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: รายชื่อหุ้น/กองทุน (ใช้ร่วมกันทั้งแอป)
export function assetsController(db: Db) {
  const service = assetsService(db);
  return { service };
}

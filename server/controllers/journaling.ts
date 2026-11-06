import type { Db } from '../db/client.js';
import { journalingService } from '../services/journaling.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: เขียน / ดู / แก้โน้ต, ฉบับร่าง, ไฟล์แนบ
export function journalingController(db: Db) {
  const service = journalingService(db);
  return { service };
}

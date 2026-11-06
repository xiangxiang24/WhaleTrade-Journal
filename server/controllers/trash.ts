import type { Db } from '../db/client.js';
import { trashService } from '../services/trash.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: ถังขยะของโน้ตและพอร์ต
export function trashController(db: Db) {
  const service = trashService(db);
  return { service };
}

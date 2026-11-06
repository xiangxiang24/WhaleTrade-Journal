import type { Db } from '../db/client.js';

// กฎของระบบและการคุยกับฐานข้อมูลของฟีเจอร์: เขียน / ดู / แก้โน้ต, ฉบับร่าง, ไฟล์แนบ
// ทุก query ต้องกรองด้วย userId ของผู้ที่ล็อกอิน
export function journalingService(_db: Db) {
  return {};
}

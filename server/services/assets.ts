import type { Db } from '../db/client.js';

// กฎของระบบและการคุยกับฐานข้อมูลของฟีเจอร์: รายชื่อหุ้น/กองทุน (ใช้ร่วมกันทั้งแอป)
// ทุก query ต้องกรองด้วย userId ของผู้ที่ล็อกอิน
export function assetsService(_db: Db) {
  return {};
}

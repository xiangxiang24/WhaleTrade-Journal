import type { Db } from '../db/client.js';

// กฎของระบบและการคุยกับฐานข้อมูลของฟีเจอร์: แผนที่บันทึกไว้
// ทุก query ต้องกรองด้วย userId ของผู้ที่ล็อกอิน
export function savedPlanService(_db: Db) {
  return {};
}

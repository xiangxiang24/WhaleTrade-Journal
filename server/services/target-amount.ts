import type { Db } from '../db/client.js';

// กฎของระบบและการคุยกับฐานข้อมูลของฟีเจอร์: เครื่องคำนวณเงินเป้าหมาย
// ทุก query ต้องกรองด้วย userId ของผู้ที่ล็อกอิน
export function targetAmountService(_db: Db) {
  return {};
}

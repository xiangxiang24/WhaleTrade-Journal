import type { Db } from '../db/client.js';

// กฎของระบบและการคุยกับฐานข้อมูลของฟีเจอร์: หน้าพอร์ตเดียว: Goal, transaction, Export CSV
// ทุก query ต้องกรองด้วย userId ของผู้ที่ล็อกอิน
export function transactionLogsService(_db: Db) {
  return {};
}

import type { Db } from '../db/client.js';

// กฎของระบบและการคุยกับฐานข้อมูลของฟีเจอร์: ถังขยะของโน้ตและพอร์ต
// ทุก query ต้องกรองด้วย userId ของผู้ที่ล็อกอิน
export function trashService(_db: Db) {
  return {};
}

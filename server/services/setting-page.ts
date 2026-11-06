import type { Db } from '../db/client.js';

// กฎของระบบและการคุยกับฐานข้อมูลของฟีเจอร์: บัญชี ภาษา เขตเวลา ความปลอดภัย
// ทุก query ต้องกรองด้วย userId ของผู้ที่ล็อกอิน
export function settingPageService(_db: Db) {
  return {};
}

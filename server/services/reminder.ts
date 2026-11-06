import type { Db } from '../db/client.js';

// กฎของระบบและการคุยกับฐานข้อมูลของฟีเจอร์: การเตือน ปฏิทิน และ task
// ทุก query ต้องกรองด้วย userId ของผู้ที่ล็อกอิน
export function reminderService(_db: Db) {
  return {};
}

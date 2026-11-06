import type { Db } from '../db/client.js';

// กฎของระบบและการคุยกับฐานข้อมูลของฟีเจอร์: สมัครสมาชิก / ล็อกอิน / กู้รหัสผ่าน (Auth)
// ทุก query ต้องกรองด้วย userId ของผู้ที่ล็อกอิน
export function onboardingService(_db: Db) {
  return {};
}

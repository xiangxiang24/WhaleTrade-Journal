import type { Db } from '../db/client.js';
import { onboardingService } from '../services/onboarding.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: สมัครสมาชิก / ล็อกอิน / กู้รหัสผ่าน (Auth)
export function onboardingController(db: Db) {
  const service = onboardingService(db);
  return { service };
}

import { Router } from 'express';
import type { Db } from '../db/client.js';
import { onboardingController } from '../controllers/onboarding.js';

// endpoints ของฟีเจอร์: สมัครสมาชิก / ล็อกอิน / กู้รหัสผ่าน (Auth)
export function onboardingRoutes(db: Db) {
  const router = Router();
  const controller = onboardingController(db);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

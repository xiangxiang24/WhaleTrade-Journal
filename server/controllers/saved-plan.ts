import type { Db } from '../db/client.js';
import { savedPlanService } from '../services/saved-plan.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: แผนที่บันทึกไว้
export function savedPlanController(db: Db) {
  const service = savedPlanService(db);
  return { service };
}

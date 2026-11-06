import type { AppContext } from '../context.js';
import { savedPlanService } from '../services/saved-plan.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: แผนที่บันทึกไว้
export function savedPlanController(ctx: AppContext) {
  const service = savedPlanService(ctx);
  return { service };
}

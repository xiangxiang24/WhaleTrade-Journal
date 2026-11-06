import type { AppContext } from '../context.js';
import { reminderService } from '../services/reminder.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: การเตือน ปฏิทิน และ task
export function reminderController(ctx: AppContext) {
  const service = reminderService(ctx);
  return { service };
}

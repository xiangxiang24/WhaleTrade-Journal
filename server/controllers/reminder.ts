import type { Db } from '../db/client.js';
import { reminderService } from '../services/reminder.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: การเตือน ปฏิทิน และ task
export function reminderController(db: Db) {
  const service = reminderService(db);
  return { service };
}

import type { Db } from '../db/client.js';
import { settingPageService } from '../services/setting-page.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: บัญชี ภาษา เขตเวลา ความปลอดภัย
export function settingPageController(db: Db) {
  const service = settingPageService(db);
  return { service };
}

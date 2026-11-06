import type { AppContext } from '../context.js';
import { settingPageService } from '../services/setting-page.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: บัญชี ภาษา เขตเวลา ความปลอดภัย
export function settingPageController(ctx: AppContext) {
  const service = settingPageService(ctx);
  return { service };
}

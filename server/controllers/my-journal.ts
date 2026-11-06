import type { AppContext } from '../context.js';
import { myJournalService } from '../services/my-journal.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: หน้ารวมบันทึก (ไทม์ไลน์ ค้นหา กรองอารมณ์ Export CSV)
export function myJournalController(ctx: AppContext) {
  const service = myJournalService(ctx);
  return { service };
}

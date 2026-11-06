import type { Db } from '../db/client.js';
import { myJournalService } from '../services/my-journal.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: หน้ารวมบันทึก (ไทม์ไลน์ ค้นหา กรองอารมณ์ Export CSV)
export function myJournalController(db: Db) {
  const service = myJournalService(db);
  return { service };
}

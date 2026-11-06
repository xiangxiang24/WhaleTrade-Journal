import { Router } from 'express';
import type { AppContext } from '../context.js';
import { myJournalController } from '../controllers/my-journal.js';

// endpoints ของฟีเจอร์: หน้ารวมบันทึก (ไทม์ไลน์ ค้นหา กรองอารมณ์ Export CSV)
export function myJournalRoutes(ctx: AppContext) {
  const router = Router();
  const controller = myJournalController(ctx);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

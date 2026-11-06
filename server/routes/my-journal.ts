import { Router } from 'express';
import type { Db } from '../db/client.js';
import { myJournalController } from '../controllers/my-journal.js';

// endpoints ของฟีเจอร์: หน้ารวมบันทึก (ไทม์ไลน์ ค้นหา กรองอารมณ์ Export CSV)
export function myJournalRoutes(db: Db) {
  const router = Router();
  const controller = myJournalController(db);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

import { Router } from 'express';
import type { AppContext } from '../../context.js';
import { myJournalController } from '../../controllers/my-journal/my-journal.js';
import { requireAuth } from '../../middleware/auth.js';

// endpoints ของฟีเจอร์: หน้ารวมบันทึก (ไทม์ไลน์ Export CSV) ต้องประกาศก่อน routes/journaling.ts เพราะ /api/notes/export.csv ชนกับ /api/notes/:id
export function myJournalRoutes(ctx: AppContext) {
  const router = Router();
  const controller = myJournalController(ctx);
  const auth = requireAuth(ctx);

  router.get('/api/notes', auth, controller.list);
  router.get('/api/notes/export.csv', auth, controller.exportCsv);

  return router;
}

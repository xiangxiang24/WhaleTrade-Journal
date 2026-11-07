import { Router } from 'express';
import type { AppContext } from '../../context.js';
import { trashController } from '../../controllers/trash/trash.js';
import { requireAuth } from '../../middleware/auth.js';

// endpoints ของฟีเจอร์: ถังขยะของโน้ต พอร์ต และแผนที่บันทึก (กู้คืนไม่ต้องยืนยัน ลบถาวรผู้ใช้ต้องกดเอง ฝั่งหน้าจอถามยืนยันก่อน)
export function trashRoutes(ctx: AppContext) {
  const router = Router();
  const controller = trashController(ctx);
  const auth = requireAuth(ctx);

  router.get('/api/trash/notes', auth, controller.listNotes);
  router.delete('/api/trash/notes', auth, controller.emptyNotes);
  router.post('/api/trash/notes/:id/restore', auth, controller.restoreNote);
  router.delete('/api/trash/notes/:id', auth, controller.purgeNote);

  router.get('/api/trash/portfolios', auth, controller.listPortfolios);
  router.delete('/api/trash/portfolios', auth, controller.emptyPortfolios);
  router.post('/api/trash/portfolios/:id/restore', auth, controller.restorePortfolio);
  router.delete('/api/trash/portfolios/:id', auth, controller.purgePortfolio);

  router.get('/api/trash/plans', auth, controller.listPlans);
  router.delete('/api/trash/plans', auth, controller.emptyPlans);
  router.post('/api/trash/plans/:id/restore', auth, controller.restorePlan);
  router.delete('/api/trash/plans/:id', auth, controller.purgePlan);

  return router;
}

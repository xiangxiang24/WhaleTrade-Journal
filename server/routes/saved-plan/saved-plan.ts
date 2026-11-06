import { Router } from 'express';
import type { AppContext } from '../../context.js';
import { savedPlanController } from '../../controllers/saved-plan/saved-plan.js';
import { requireAuth } from '../../middleware/auth.js';

// endpoints ของฟีเจอร์: แผนที่บันทึกไว้ (บันทึก / เปิด / เปลี่ยนชื่อ / ลบ)
export function savedPlanRoutes(ctx: AppContext) {
  const router = Router();
  const controller = savedPlanController(ctx);
  const auth = requireAuth(ctx);

  router.get('/api/plans', auth, controller.list);
  router.post('/api/plans', auth, controller.create);
  router.get('/api/plans/portfolio-names', auth, controller.portfolioNames);
  router.get('/api/plans/:id', auth, controller.get);
  router.patch('/api/plans/:id', auth, controller.rename);
  router.delete('/api/plans/:id', auth, controller.remove);

  return router;
}

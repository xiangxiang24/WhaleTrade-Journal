import { Router } from 'express';
import type { AppContext } from '../../context.js';
import { portfolioController } from '../../controllers/portfolio/portfolio.js';
import { requireAuth } from '../../middleware/auth.js';

// endpoints ของฟีเจอร์: รายการพอร์ต (สร้าง / แก้ / ย้ายไปถังขยะ / กู้คืน)
export function portfolioRoutes(ctx: AppContext) {
  const router = Router();
  const controller = portfolioController(ctx);
  const auth = requireAuth(ctx);

  router.get('/api/portfolios', auth, controller.list);
  router.post('/api/portfolios', auth, controller.create);
  router.get('/api/portfolios/:id', auth, controller.get);
  router.put('/api/portfolios/:id', auth, controller.update);
  router.delete('/api/portfolios/:id', auth, controller.trash);
  router.post('/api/portfolios/:id/restore', auth, controller.restore);

  return router;
}

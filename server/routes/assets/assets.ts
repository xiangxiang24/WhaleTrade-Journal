import { Router } from 'express';
import type { AppContext } from '../../context.js';
import { assetsController } from '../../controllers/assets/assets.js';
import { requireAuth } from '../../middleware/auth.js';

// endpoints ของฟีเจอร์: รายชื่อหุ้น/กองทุน (ใช้ร่วมกันทั้งแอป)
export function assetsRoutes(ctx: AppContext) {
  const router = Router();
  const controller = assetsController(ctx);

  router.get('/api/assets', requireAuth(ctx), controller.list);

  return router;
}

import { Router } from 'express';
import type { AppContext } from '../../context.js';
import { targetAmountController } from '../../controllers/target-amount/target-amount.js';
import { requireAuth } from '../../middleware/auth.js';

// endpoints ของฟีเจอร์: เครื่องคำนวณเงินเป้าหมาย (ไม่แตะฐานข้อมูล)
export function targetAmountRoutes(ctx: AppContext) {
  const router = Router();
  const controller = targetAmountController(ctx);

  router.post('/api/calculator/calculate', requireAuth(ctx), controller.calculate);

  return router;
}

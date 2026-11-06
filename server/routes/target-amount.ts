import { Router } from 'express';
import type { AppContext } from '../context.js';
import { targetAmountController } from '../controllers/target-amount.js';

// endpoints ของฟีเจอร์: เครื่องคำนวณเงินเป้าหมาย
export function targetAmountRoutes(ctx: AppContext) {
  const router = Router();
  const controller = targetAmountController(ctx);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

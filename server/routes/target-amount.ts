import { Router } from 'express';
import type { Db } from '../db/client.js';
import { targetAmountController } from '../controllers/target-amount.js';

// endpoints ของฟีเจอร์: เครื่องคำนวณเงินเป้าหมาย
export function targetAmountRoutes(db: Db) {
  const router = Router();
  const controller = targetAmountController(db);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

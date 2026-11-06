import { Router } from 'express';
import type { AppContext } from '../context.js';
import { transactionLogsController } from '../controllers/transaction-logs.js';

// endpoints ของฟีเจอร์: หน้าพอร์ตเดียว: Goal, transaction, Export CSV
export function transactionLogsRoutes(ctx: AppContext) {
  const router = Router();
  const controller = transactionLogsController(ctx);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

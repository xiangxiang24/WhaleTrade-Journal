import { Router } from 'express';
import type { Db } from '../db/client.js';
import { transactionLogsController } from '../controllers/transaction-logs.js';

// endpoints ของฟีเจอร์: หน้าพอร์ตเดียว: Goal, transaction, Export CSV
export function transactionLogsRoutes(db: Db) {
  const router = Router();
  const controller = transactionLogsController(db);
  void controller; // ใช้เมื่อเพิ่ม endpoint เช่น router.get('/api/...', controller.xxx)

  return router;
}

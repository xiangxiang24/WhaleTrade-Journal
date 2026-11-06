import type { AppContext } from '../context.js';
import { transactionLogsService } from '../services/transaction-logs.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: หน้าพอร์ตเดียว: Goal, transaction, Export CSV
export function transactionLogsController(ctx: AppContext) {
  const service = transactionLogsService(ctx);
  return { service };
}

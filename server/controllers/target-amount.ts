import type { Db } from '../db/client.js';
import { targetAmountService } from '../services/target-amount.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: เครื่องคำนวณเงินเป้าหมาย
export function targetAmountController(db: Db) {
  const service = targetAmountService(db);
  return { service };
}

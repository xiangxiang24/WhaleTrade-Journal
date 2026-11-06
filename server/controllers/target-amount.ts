import type { AppContext } from '../context.js';
import { targetAmountService } from '../services/target-amount.js';

// รับ request / ตรวจข้อมูลที่ส่งมา / ตอบ response ของฟีเจอร์: เครื่องคำนวณเงินเป้าหมาย
export function targetAmountController(ctx: AppContext) {
  const service = targetAmountService(ctx);
  return { service };
}

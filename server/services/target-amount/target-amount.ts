import type { AppContext } from '../../context.js';
import { calculatePlan, type CalcInput, type CalcOutput } from '../shared/calculate-plan.js';

// เครื่องคำนวณเงินเป้าหมาย: คำนวณอย่างเดียว ไม่เขียนอะไรลงฐานข้อมูล (บันทึกแผนอยู่ที่ฟีเจอร์ saved-plan)
export function targetAmountService(_ctx: AppContext) {
  return {
    calculate(input: CalcInput): CalcOutput {
      return calculatePlan(input);
    },
  };
}

import { request } from '../../shared/apis/client'
import type { CalcInput, CalcOutput } from '../../shared/types/calc-plan'

// POST /api/calculator/calculate  (คำนวณอย่างเดียว ไม่เขียนอะไรลงฐานข้อมูล)
export const calculatePlan = (input: CalcInput) =>
  request<CalcOutput>('/api/calculator/calculate', { method: 'POST', body: input })

import type { CalcPlan } from '../types/calc-plan'

// ที่เก็บข้อมูลจำลองของแผนที่บันทึก (ในหน่วยความจำ) ใช้ร่วมกับหน้า Saved Plan ภายหลัง ไฟล์เดียวที่ต้องแก้ตอนต่อ backend
let plans: CalcPlan[] = []
let nextId = 1

const LATENCY_MS = 300
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

// GET /calc-plans (ใหม่ → เก่า)
export async function fetchCalcPlans(): Promise<CalcPlan[]> {
  await delay()
  return [...plans].sort((a, b) => b.savedAt.localeCompare(a.savedAt)).map((plan) => ({ ...plan }))
}

// POST /calc-plans (กด Save plan เท่านั้น กด Calculate ไม่เขียนอะไรลง DB)
export async function createCalcPlan(values: Omit<CalcPlan, 'id' | 'savedAt'>): Promise<CalcPlan> {
  await delay()
  const created: CalcPlan = { ...values, id: nextId++, savedAt: new Date().toISOString() }
  plans = [...plans, created]
  return { ...created }
}

import type { CalcPlan } from '../types/calc-plan'
import { calculatePlan } from './calculate-plan'

// ที่เก็บข้อมูลจำลองของแผนที่บันทึก (ในหน่วยความจำ) ใช้ร่วมกันระหว่างหน้า Target Amount (Save plan) และ Saved Plan
// ไฟล์เดียวที่ต้องแก้ตอนต่อ backend; รีเฟรชแล้วกลับเป็นค่าเริ่มต้น

function seedPlan(values: Omit<CalcPlan, 'resultAmount'>): CalcPlan {
  const avg = values.assets.reduce((sum, asset) => sum + asset.dividendPct, 0) / values.assets.length
  const { total } = calculatePlan({ principal: values.principal, phases: values.phases, avgYieldPct: avg })
  return { ...values, resultAmount: total }
}

let plans: CalcPlan[] = [
  seedPlan({
    id: 1,
    portfolioId: 1,
    name: 'Retire at 60',
    principal: 100_000,
    phases: [
      { years: 2, monthlyDca: 5_000 },
      { years: 8, monthlyDca: 8_000 },
    ],
    assets: [
      { assetId: 1, dividendPct: 7.1 },
      { assetId: 2, dividendPct: 6.4 },
      { assetId: 3, dividendPct: 7.8 },
    ],
    savedAt: '2026-10-09T05:00:00Z',
  }),
  seedPlan({
    id: 2,
    portfolioId: null,
    name: 'Steady 5,000 a month',
    principal: 50_000,
    phases: [{ years: 8, monthlyDca: 5_000 }],
    assets: [
      { assetId: 5, dividendPct: 6 },
      { assetId: 4, dividendPct: 5.5 },
    ],
    savedAt: '2026-10-02T05:00:00Z',
  }),
  seedPlan({
    id: 3,
    portfolioId: 1,
    name: 'Faster DCA',
    principal: 100_000,
    phases: [
      { years: 5, monthlyDca: 8_000 },
      { years: 10, monthlyDca: 10_000 },
    ],
    assets: [
      { assetId: 1, dividendPct: 7.1 },
      { assetId: 3, dividendPct: 7.8 },
    ],
    savedAt: '2026-09-21T05:00:00Z',
  }),
]
let nextId = 4

const LATENCY_MS = 300
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

const newestFirst = (a: CalcPlan, b: CalcPlan) => b.savedAt.localeCompare(a.savedAt)

// GET /calc-plans (ใหม่ → เก่า)
export async function fetchCalcPlans(): Promise<CalcPlan[]> {
  await delay()
  return [...plans].sort(newestFirst).map((plan) => ({ ...plan }))
}

// GET /calc-plans/:id (ไม่พบ = null)
export async function fetchCalcPlan(id: number): Promise<CalcPlan | null> {
  await delay()
  const found = plans.find((plan) => plan.id === id)
  return found ? { ...found } : null
}

// POST /calc-plans (กด Save plan เท่านั้น กด Calculate ไม่เขียนอะไรลง DB)
export async function createCalcPlan(values: Omit<CalcPlan, 'id' | 'savedAt'>): Promise<CalcPlan> {
  await delay()
  const created: CalcPlan = { ...values, id: nextId++, savedAt: new Date().toISOString() }
  plans = [...plans, created]
  return { ...created }
}

// PATCH /calc-plans/:id (เปลี่ยนชื่อ) วันที่บันทึกไม่เปลี่ยน
export async function renameCalcPlan(id: number, name: string): Promise<CalcPlan> {
  await delay()
  const current = plans.find((plan) => plan.id === id)
  if (!current) throw new Error('This plan no longer exists.')
  const updated: CalcPlan = { ...current, name }
  plans = plans.map((plan) => (plan.id === id ? updated : plan))
  return { ...updated }
}

// DELETE /calc-plans/:id (ลบจริง ไม่มีถังขยะ)
export async function deleteCalcPlan(id: number): Promise<void> {
  await delay()
  if (!plans.some((plan) => plan.id === id)) throw new Error('This plan no longer exists.')
  plans = plans.filter((plan) => plan.id !== id)
}

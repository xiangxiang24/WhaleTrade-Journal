import type { CalcPlan } from '../../shared/types/calc-plan'

export type SavedPlanLoadStatus = 'loading' | 'ready' | 'error'
export type PlanDetailStatus = 'loading' | 'ready' | 'error' | 'missing'

/** ข้อความแจ้งผลชั่วคราว (ใช้ type เดียวกับหน้า Portfolio) */
export type { PortfolioToast as PlanToast } from '../../portfolio/types/portfolio'

/** ระยะเวลารวมของแผน = ผลรวม years ของทุกเฟส (ไม่เก็บใน DB) */
export const planYears = (plan: CalcPlan) => plan.phases.reduce((sum, phase) => sum + phase.years, 0)

/** ป้ายแหล่งที่มา: ชื่อพอร์ต หรือ "Manual Portfolio" เมื่อกรอกเอง (หรือพอร์ตถูกลบถาวรแล้ว) */
export const planSource = (plan: CalcPlan, names: Map<number, string>) =>
  (plan.portfolioId !== null ? names.get(plan.portfolioId) : undefined) ?? 'Manual Portfolio'

export const formatYears = (years: number) => `${years} ${years === 1 ? 'year' : 'years'}`

/** วันที่บันทึก เช่น "Oct 9, 2026" ตามเขตเวลาผู้ใช้ */
export function formatSavedDate(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone }).format(new Date(iso))
}

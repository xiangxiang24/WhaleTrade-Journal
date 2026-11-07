import type { TrashedCalcPlan } from '../../shared/types/calc-plan'
import type { TrashedNote } from '../../shared/types/journal-note'
import type { TrashedPortfolio } from '../../shared/types/portfolio'

export type TrashLoadStatus = 'loading' | 'ready' | 'error'
export type TrashTab = 'journals' | 'portfolios' | 'plans'

/** ข้อความแจ้งผลชั่วคราว (ใช้ type เดียวกับหน้า Portfolio; หน้านี้ไม่มี Undo) */
export type { PortfolioToast as TrashToast } from '../../portfolio/types/portfolio'

/** รายการที่กำลังจะลบถาวร (ถามยืนยันก่อนเสมอ) */
export type PurgeTarget =
  | { kind: 'journal'; note: TrashedNote }
  | { kind: 'portfolio'; portfolio: TrashedPortfolio }
  | { kind: 'plan'; plan: TrashedCalcPlan }

/** ค้นหาตามหัวข้อโน้ต (ไม่มีหัวข้อ = ใช้ชื่อเริ่มต้น) ชื่อพอร์ต หรือชื่อแผน ไม่สนตัวพิมพ์ใหญ่เล็ก */
export const matchesQuery = (text: string, query: string) => text.toLowerCase().includes(query.trim().toLowerCase())

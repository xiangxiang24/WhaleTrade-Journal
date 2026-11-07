import { request } from '../../shared/apis/client'
import type { JournalNote, TrashedNote } from '../../shared/types/journal-note'
import type { CalcPlan, TrashedCalcPlan } from '../../shared/types/calc-plan'
import type { Portfolio, TrashedPortfolio } from '../../shared/types/portfolio'

// ===== โน้ต =====
// GET /api/trash/notes  (ลบล่าสุดก่อน)
export const fetchTrashedNotes = () => request<TrashedNote[]>('/api/trash/notes')

// POST /api/trash/notes/:id/restore
export const restoreJournalNote = (id: number) =>
  request<JournalNote>(`/api/trash/notes/${id}/restore`, { method: 'POST' })

// DELETE /api/trash/notes/:id  (ลบถาวร: ลบไฟล์แนบและฉบับร่างด้วย)
export const purgeJournalNote = (id: number) => request<void>(`/api/trash/notes/${id}`, { method: 'DELETE' })

// DELETE /api/trash/notes  (ล้างถังขยะของโน้ต คืนจำนวนที่ลบ)
export const emptyJournalTrash = async () => (await request<{ deleted: number }>('/api/trash/notes', { method: 'DELETE' })).deleted

// ===== พอร์ต =====
// GET /api/trash/portfolios  (ลบล่าสุดก่อน พร้อมจำนวนแผนที่อ้างอิง)
export const fetchTrashedPortfolios = () => request<TrashedPortfolio[]>('/api/trash/portfolios')

// POST /api/trash/portfolios/:id/restore
export const restorePortfolio = (id: number) =>
  request<Portfolio>(`/api/trash/portfolios/${id}/restore`, { method: 'POST' })

// DELETE /api/trash/portfolios/:id  (ลบพอร์ตและ transaction ถาวร แผนที่อ้างอิงเปลี่ยนเป็น "กรอกเอง")
export const purgePortfolio = (id: number) => request<void>(`/api/trash/portfolios/${id}`, { method: 'DELETE' })

// DELETE /api/trash/portfolios  (ล้างถังขยะของพอร์ต คืนจำนวนที่ลบ)
export const emptyPortfolioTrash = async () => (await request<{ deleted: number }>('/api/trash/portfolios', { method: 'DELETE' })).deleted

// ===== แผนที่บันทึก =====
// GET /api/trash/plans  (ลบล่าสุดก่อน)
export const fetchTrashedPlans = () => request<TrashedCalcPlan[]>('/api/trash/plans')

// POST /api/trash/plans/:id/restore
export const restoreCalcPlan = (id: number) => request<CalcPlan>(`/api/trash/plans/${id}/restore`, { method: 'POST' })

// DELETE /api/trash/plans/:id  (ลบถาวร พร้อมเฟสและรายการหุ้นของแผน)
export const purgeCalcPlan = (id: number) => request<void>(`/api/trash/plans/${id}`, { method: 'DELETE' })

// DELETE /api/trash/plans  (ล้างถังขยะของแผน คืนจำนวนที่ลบ)
export const emptyPlanTrash = async () => (await request<{ deleted: number }>('/api/trash/plans', { method: 'DELETE' })).deleted

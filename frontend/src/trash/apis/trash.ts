import { request } from '../../shared/apis/client'
import type { JournalNote, TrashedNote } from '../../shared/types/journal-note'
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

import { request } from '../../shared/apis/client'
import type { Portfolio, PortfolioFormValues } from '../../shared/types/portfolio'

// GET /api/portfolios  (ไม่รวมถังขยะ พร้อมค่าสรุปที่คำนวณจาก transaction)
export const fetchPortfolios = () => request<Portfolio[]>('/api/portfolios')

// GET /api/portfolios/:id
export const fetchPortfolio = (id: number) => request<Portfolio>(`/api/portfolios/${id}`)

// POST /api/portfolios
export const createPortfolio = (values: PortfolioFormValues) =>
  request<Portfolio>('/api/portfolios', { method: 'POST', body: values })

// PUT /api/portfolios/:id
export const updatePortfolio = (id: number, values: PortfolioFormValues) =>
  request<Portfolio>(`/api/portfolios/${id}`, { method: 'PUT', body: values })

// DELETE /api/portfolios/:id  (ย้ายไปถังขยะ transaction ไม่ถูกแตะ)
export const trashPortfolio = (id: number) => request<void>(`/api/portfolios/${id}`, { method: 'DELETE' })

// POST /api/portfolios/:id/restore  (ปุ่ม Undo)
export const restorePortfolio = (id: number) => request<Portfolio>(`/api/portfolios/${id}/restore`, { method: 'POST' })

import { request } from '../../shared/apis/client'
import type { CalcPlan } from '../../shared/types/calc-plan'

// GET /api/plans  (ใหม่ → เก่า)
export const fetchCalcPlans = () => request<CalcPlan[]>('/api/plans')

// GET /api/plans/:id
export const fetchCalcPlan = (id: number) => request<CalcPlan>(`/api/plans/${id}`)

// POST /api/plans  (กด Save plan เท่านั้น ผลลัพธ์คำนวณใหม่ที่ backend ไม่ต้องส่ง resultAmount)
export const createCalcPlan = (values: Omit<CalcPlan, 'id' | 'savedAt' | 'resultAmount'>) =>
  request<CalcPlan>('/api/plans', { method: 'POST', body: values })

// PATCH /api/plans/:id  (เปลี่ยนชื่อ)
export const renameCalcPlan = (id: number, name: string) =>
  request<CalcPlan>(`/api/plans/${id}`, { method: 'PATCH', body: { name } })

// DELETE /api/plans/:id
export const deleteCalcPlan = (id: number) => request<void>(`/api/plans/${id}`, { method: 'DELETE' })

// GET /api/plans/portfolio-names  (ชื่อพอร์ตทั้งหมดรวมที่อยู่ในถังขยะ ใช้แสดงแหล่งที่มาของแผน)
export const fetchPortfolioNames = async () =>
  new Map((await request<{ id: number; name: string }[]>('/api/plans/portfolio-names')).map((item) => [item.id, item.name]))

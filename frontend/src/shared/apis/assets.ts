import { request } from './client'
import type { Asset } from '../types/transaction'

// GET /api/assets?q=&limit=  (ค้นจากชื่อหรือ ticker ไม่ส่ง q = ทั้งหมด)
export const searchAssets = (query = '', limit = 8) =>
  request<Asset[]>(`/api/assets?q=${encodeURIComponent(query)}&limit=${limit}`)

// GET /api/assets  (ใช้สร้างตารางค้น id → asset)
export const fetchAssets = () => request<Asset[]>('/api/assets')

// GET /api/assets?ids=1,2,3
export const fetchAssetsByIds = (ids: number[]) => request<Asset[]>(`/api/assets?ids=${ids.join(',')}`)

import { fetchAssets } from '../apis/assets'
import type { Asset } from '../types/transaction'

// รายการหุ้น/กองทุน (อ่านอย่างเดียว ไม่ผูกกับผู้ใช้) โหลดจาก backend ครั้งเดียวหลังล็อกอิน แล้วเก็บในหน่วยความจำให้ทุกหน้าใช้แบบทันที
export const ASSETS: Asset[] = []
export const ASSET_BY_ID = new Map<number, Asset>()

/** โหลดรายการหุ้นจาก backend (เรียกหลังล็อกอิน/เปิดแอปด้วย token เดิม) */
export async function loadAssets(): Promise<void> {
  const loaded = await fetchAssets()
  ASSETS.splice(0, ASSETS.length, ...loaded)
  ASSET_BY_ID.clear()
  for (const asset of loaded) ASSET_BY_ID.set(asset.id, asset)
}

// ค้นจากชื่อหรือ ticker (ไม่สนตัวพิมพ์ใหญ่เล็ก) ใช้กับช่องเลือกหุ้นในฟอร์ม
// รายชื่อมีหมื่นกว่าตัว จึงจัดอันดับให้ ticker ตรงเป๊ะขึ้นก่อน ตามด้วย ticker ที่ขึ้นต้นด้วยคำค้น แล้วค่อยเป็นที่เหลือ
export function searchAssets(query: string, limit = 8): Asset[] {
  const keyword = query.trim().toLowerCase()
  if (!keyword) return ASSETS.slice(0, limit)
  const exact: Asset[] = []
  const prefix: Asset[] = []
  const rest: Asset[] = []
  for (const asset of ASSETS) {
    const ticker = asset.ticker.toLowerCase()
    if (ticker === keyword) exact.push(asset)
    else if (ticker.startsWith(keyword)) prefix.push(asset)
    else if (rest.length < limit && (ticker.includes(keyword) || asset.name.toLowerCase().includes(keyword))) rest.push(asset)
    if (exact.length + prefix.length >= limit && rest.length >= limit) break
  }
  return [...exact, ...prefix, ...rest].slice(0, limit)
}

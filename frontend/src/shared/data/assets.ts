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
export function searchAssets(query: string, limit = 8): Asset[] {
  const keyword = query.trim().toLowerCase()
  const matches = keyword
    ? ASSETS.filter(
        (asset) => asset.ticker.toLowerCase().includes(keyword) || asset.name.toLowerCase().includes(keyword),
      )
    : ASSETS
  return matches.slice(0, limit)
}

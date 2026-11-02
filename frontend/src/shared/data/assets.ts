import type { Asset } from '../types/transaction'

// รายการหุ้น/กองทุนตัวอย่าง (ของจริงนำเข้าจาก seed/assets.json อ่านอย่างเดียว ไม่ผูกกับผู้ใช้)
export const ASSETS: Asset[] = [
  { id: 1, ticker: 'SCB', name: 'SCB X Public Co.', type: 'stock', market: 'SET', sector: 'Banking' },
  { id: 2, ticker: 'PTTEP', name: 'PTT Exploration & Prod.', type: 'stock', market: 'SET', sector: 'Energy' },
  { id: 3, ticker: 'TTB', name: 'TMBThanachart Bank', type: 'stock', market: 'SET', sector: 'Banking' },
  { id: 4, ticker: 'KBANK', name: 'Kasikornbank', type: 'stock', market: 'SET', sector: 'Banking' },
  { id: 5, ticker: 'TISCO', name: 'TISCO Financial Group', type: 'stock', market: 'SET', sector: 'Banking' },
  { id: 6, ticker: 'ADVANC', name: 'Advanced Info Service', type: 'stock', market: 'SET', sector: 'Communication' },
  { id: 7, ticker: 'CPALL', name: 'CP All', type: 'stock', market: 'SET', sector: 'Commerce' },
  { id: 8, ticker: 'SCC', name: 'Siam Cement', type: 'stock', market: 'SET', sector: 'Materials' },
  { id: 9, ticker: 'AOT', name: 'Airports of Thailand', type: 'stock', market: 'SET', sector: 'Transport' },
  { id: 10, ticker: 'KO', name: 'Coca-Cola Co.', type: 'stock', market: 'US', sector: 'Consumer' },
  { id: 11, ticker: 'O', name: 'Realty Income Corp.', type: 'stock', market: 'US', sector: 'Real Estate' },
  { id: 12, ticker: 'AAPL', name: 'Apple Inc.', type: 'stock', market: 'US', sector: 'Technology' },
  { id: 13, ticker: 'SET50-D', name: 'SET50 Dividend Index Fund', type: 'fund', market: 'TH-FUND', sector: null },
]

export const ASSET_BY_ID = new Map(ASSETS.map((asset) => [asset.id, asset]))

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

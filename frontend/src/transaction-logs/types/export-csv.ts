import { ASSET_BY_ID } from '../../shared/data/assets'
import { txAmount } from '../../shared/data/portfolio-math'
import type { Transaction } from '../../shared/types/transaction'

const BOM = String.fromCharCode(0xfeff)
const HEADER = ['Date', 'Type', 'Ticker', 'Name', 'Market', 'Sector', 'Tag', 'Price', 'Units', 'Fee', 'Amount (THB)', 'Note']

// ป้องกัน CSV injection: เซลล์ที่ขึ้นต้นด้วย = + - @ จะถูก Excel ตีเป็นสูตร จึงนำหน้าด้วย '
function cell(value: string | number | null | undefined) {
  if (value === null || value === undefined) return ''
  const text = String(value)
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** สร้างข้อความ CSV ของ transaction (เก่า → ใหม่) ใส่ UTF-8 BOM ให้ภาษาไทยเปิดใน Excel ได้ */
export function buildTransactionsCsv(txs: Transaction[]) {
  const rows = [...txs]
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id)
    .map((tx) => {
      const asset = ASSET_BY_ID.get(tx.assetId)
      return [
        tx.date,
        tx.type,
        asset?.ticker,
        asset?.name,
        asset?.market,
        asset?.sector,
        tx.tag,
        tx.price,
        tx.units,
        tx.fee,
        txAmount(tx),
        tx.note,
      ]
        .map(cell)
        .join(',')
    })
  return `${BOM}${[HEADER.join(','), ...rows].join('\r\n')}\r\n`
}

/** ดาวน์โหลดไฟล์ CSV ผ่านเบราว์เซอร์ (ทำงานในแอป Electron ได้เหมือนกัน) */
export function downloadCsv(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** ชื่อไฟล์ที่ปลอดภัยจากชื่อพอร์ต เช่น "Dividend Sanctuary" → "dividend-sanctuary-transactions.csv" */
export function csvFilename(portfolioName: string) {
  const slug = portfolioName.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '')
  return `${slug || 'portfolio'}-transactions.csv`
}

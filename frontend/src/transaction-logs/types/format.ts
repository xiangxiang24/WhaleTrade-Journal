const WHOLE = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export const formatBaht = (value: number) => WHOLE.format(Math.round(value))

/** ตัวเลขทศนิยมไม่เกิน `digits` ตำแหน่ง ไม่เติมศูนย์ท้ายเกินจำเป็น เช่น 100.5 → "100.5" */
export function formatDecimal(value: number, digits = 2) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value)
}

/** เปอร์เซ็นต์ 1 ตำแหน่ง เช่น 6.85 → "6.9%" ต้องการ 2 ตำแหน่งให้ส่ง digits */
export const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`

// วันที่ transaction เป็น "วันที่ตามปฏิทิน" (YYYY-MM-DD) จึงแปลงแบบ UTC เพื่อไม่ให้วันเลื่อนตามเขตเวลา
const asDate = (value: string) => new Date(`${value}T00:00:00Z`)

/** 2026-10-12 → "12 Oct 2026" (en-US ให้ชื่อเดือนย่อสม่ำเสมอ เช่น Sep ไม่ใช่ Sept) */
export function formatTxDate(value: string, locale = 'en-US') {
  const parts = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).formatToParts(
    asDate(value),
  )
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${pick('day')} ${pick('month')} ${pick('year')}`
}

/** 2026-10 → "October 2026" */
export function formatMonthHeading(month: string, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    asDate(`${month}-01`),
  )
}

/** 2026-10 → "Oct 2026" */
export function formatMonthShort(month: string, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    asDate(`${month}-01`),
  )
}

/** วันที่วันนี้เป็น YYYY-MM-DD ตามเวลาท้องถิ่นของผู้ใช้ (ค่าเริ่มต้นของช่องวันที่ในฟอร์ม) */
export function todayLocal() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

const WHOLE = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export const formatBaht = (value: number) => WHOLE.format(Math.round(value))

/** 120000 → "120k", 1250 → "1.25k", ต่ำกว่าพัน = ตัวเลขเต็ม */
export function formatCompact(value: number) {
  if (Math.abs(value) < 1000) return formatBaht(value)
  return `${Number((value / 1000).toFixed(2))}k`
}

/** เปอร์เซ็นต์ 1 ตำแหน่ง เช่น 37.65 → "37.6%" (ปัดลงเพื่อไม่ให้ผลรวมเกิน 100) */
export const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`

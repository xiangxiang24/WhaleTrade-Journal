const NUMBER = new Intl.NumberFormat('en-US')

/** 2000000 → "2,000,000" */
export function formatAmount(value: number) {
  return NUMBER.format(value)
}

/** วันที่อัปเดตล่าสุด เช่น "Oct 8, 2026" ตามเขตเวลาผู้ใช้ */
export function formatUpdated(iso: string, timeZone: string, locale = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone,
  }).format(new Date(iso))
}

/** ความคืบหน้า Goal เป็นเปอร์เซ็นต์ 0-100 (ไม่มี Goal = null) ปัดลงเพื่อไม่ขึ้น 100 ก่อนถึงเป้าจริง */
export function goalProgress(reached: number, goal: number | null) {
  if (!goal) return null
  return Math.min(100, Math.floor((reached / goal) * 100))
}

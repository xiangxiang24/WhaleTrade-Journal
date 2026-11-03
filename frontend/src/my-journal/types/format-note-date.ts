// รูปแบบวันที่บนการ์ดโน้ต "21 Sep 2026 | 21:31" แปลงตามเขตเวลาของผู้ใช้ (เวลาในฐานข้อมูลเก็บเป็น UTC)
export function formatNoteDate(iso: string, timeZone: string, locale = 'en-US'): string {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso))
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  return `${get('day')} ${get('month')} ${get('year')} | ${get('hour')}:${get('minute')}`
}

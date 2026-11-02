// ตัวช่วยวัน/เวลาตามเขตเวลาของผู้ใช้ (User.timezone) ใช้กับปฏิทิน การจัดกลุ่มรายวัน และฟอร์มตั้งเวลา
// "วัน" ในที่นี้เป็นข้อความ YYYY-MM-DD (วันตามปฏิทินของผู้ใช้) ไม่ใช่ช่วงเวลา

type Zoned = { year: number; month: number; day: number; hour: number; minute: number }

function zonedParts(date: Date, timeZone: string): Zoned {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).formatToParts(date)
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value)
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute') }
}

const pad = (value: number) => String(value).padStart(2, '0')

/** วันของช่วงเวลานี้ตามเขตเวลาผู้ใช้ เช่น "2026-09-25" */
export function dayKey(value: Date | string, timeZone: string) {
  const { year, month, day } = zonedParts(typeof value === 'string' ? new Date(value) : value, timeZone)
  return `${year}-${pad(month)}-${pad(day)}`
}

/** เวลาตามเขตเวลาผู้ใช้ เช่น "09:00" */
export function timeKey(value: Date | string, timeZone: string) {
  const { hour, minute } = zonedParts(typeof value === 'string' ? new Date(value) : value, timeZone)
  return `${pad(hour)}:${pad(minute)}`
}

/** วันที่ + เวลาท้องถิ่นของผู้ใช้ → ISO UTC (ตรวจ offset ของเขตเวลา ณ เวลานั้นอีกรอบเพื่อรองรับ DST) */
export function zonedToUtc(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  const wanted = Date.UTC(year, month - 1, day, hour, minute)
  let guess = wanted
  for (let i = 0; i < 2; i++) {
    const actual = zonedParts(new Date(guess), timeZone)
    guess += wanted - Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute)
  }
  return new Date(guess).toISOString()
}

const keyToUtc = (key: string) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

const keyFromUtc = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`

export function addDays(key: string, days: number) {
  const date = keyToUtc(key)
  date.setUTCDate(date.getUTCDate() + days)
  return keyFromUtc(date)
}

/** วันจันทร์ของสัปดาห์ที่วันนี้อยู่ (สัปดาห์เริ่มวันจันทร์ ตามกฎปฏิทิน) */
export function startOfWeek(key: string) {
  const weekday = keyToUtc(key).getUTCDay() // 0 = อาทิตย์
  return addDays(key, -((weekday + 6) % 7))
}

export type MonthCell = { key: string; inMonth: boolean }

/** ตารางปฏิทินของเดือน (month 0-11) 6 แถว × 7 วัน เริ่มวันจันทร์ รวมวันนอกเดือนเพื่อให้ตารางสูงคงที่ */
export function monthGrid(year: number, month: number): MonthCell[] {
  const first = keyFromUtc(new Date(Date.UTC(year, month, 1)))
  const start = startOfWeek(first)
  return Array.from({ length: 42 }, (_, index) => {
    const key = addDays(start, index)
    return { key, inMonth: Number(key.slice(5, 7)) === month + 1 }
  })
}

const dayFormatter = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options })

/** "September 2026" */
export const formatMonthTitle = (year: number, month: number) =>
  dayFormatter({ month: 'long', year: 'numeric' }).format(new Date(Date.UTC(year, month, 1)))

/** "25 Sep 2026" */
export function formatDay(key: string, withYear = true) {
  const parts = dayFormatter({ day: 'numeric', month: 'short', year: 'numeric' }).formatToParts(keyToUtc(key))
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? ''
  return `${pick('day')} ${pick('month')}${withYear ? ` ${pick('year')}` : ''}`
}

/** "Friday, 25 September 2026" ใช้เป็น aria-label ของวันในปฏิทิน */
export const formatDayLong = (key: string) =>
  dayFormatter({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(keyToUtc(key))

/** "Today, 25 Sep 2026 • 09:00" / "Tomorrow, …" / "Yesterday, …" / "Sat, 3 Oct 2026 • 09:00" */
export function formatRemindAt(iso: string, todayKey: string, timeZone: string) {
  const key = dayKey(iso, timeZone)
  const label =
    key === todayKey
      ? 'Today'
      : key === addDays(todayKey, 1)
        ? 'Tomorrow'
        : key === addDays(todayKey, -1)
          ? 'Yesterday'
          : dayFormatter({ weekday: 'short' }).format(keyToUtc(key))
  return `${label}, ${formatDay(key)} • ${timeKey(iso, timeZone)}`
}

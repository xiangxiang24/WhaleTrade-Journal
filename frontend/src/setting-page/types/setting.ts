export type SettingLoadStatus = 'loading' | 'ready' | 'error'

/** ข้อความแจ้งผลชั่วคราว (ใช้ type เดียวกับหน้า Portfolio) */
export type { PortfolioToast as SettingToast } from '../../portfolio/types/portfolio'

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const DISPLAY_NAME_MAX = 40

// ประเทศ + เขตเวลาที่เลือกได้ (ธงสร้างจากรหัสประเทศ ป้ายเวลาคำนวณจากเขตเวลา) ค่าเริ่มต้นคือประเทศไทย
export const REGIONS = [
  { country: 'Thailand', code: 'TH', timezone: 'Asia/Bangkok' },
  { country: 'Singapore', code: 'SG', timezone: 'Asia/Singapore' },
  { country: 'Malaysia', code: 'MY', timezone: 'Asia/Kuala_Lumpur' },
  { country: 'Indonesia', code: 'ID', timezone: 'Asia/Jakarta' },
  { country: 'Vietnam', code: 'VN', timezone: 'Asia/Ho_Chi_Minh' },
  { country: 'Philippines', code: 'PH', timezone: 'Asia/Manila' },
  { country: 'Hong Kong', code: 'HK', timezone: 'Asia/Hong_Kong' },
  { country: 'China', code: 'CN', timezone: 'Asia/Shanghai' },
  { country: 'Japan', code: 'JP', timezone: 'Asia/Tokyo' },
  { country: 'South Korea', code: 'KR', timezone: 'Asia/Seoul' },
  { country: 'India', code: 'IN', timezone: 'Asia/Kolkata' },
  { country: 'United Arab Emirates', code: 'AE', timezone: 'Asia/Dubai' },
  { country: 'United Kingdom', code: 'GB', timezone: 'Europe/London' },
  { country: 'Germany', code: 'DE', timezone: 'Europe/Berlin' },
  { country: 'France', code: 'FR', timezone: 'Europe/Paris' },
  { country: 'Australia', code: 'AU', timezone: 'Australia/Sydney' },
  { country: 'United States (East)', code: 'US', timezone: 'America/New_York' },
  { country: 'United States (West)', code: 'US', timezone: 'America/Los_Angeles' },
  { country: 'Canada', code: 'CA', timezone: 'America/Toronto' },
  { country: 'Brazil', code: 'BR', timezone: 'America/Sao_Paulo' },
] as const

/** TH → 🇹🇭 (regional indicator 2 ตัว) */
export const flagOf = (code: string) => String.fromCodePoint(...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65))

/** เขตเวลา → "UTC+07:00" (ตามเวลาปัจจุบัน รองรับ DST) */
export function utcOffset(timeZone: string) {
  const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
    .formatToParts(new Date())
    .find((item) => item.type === 'timeZoneName')?.value
  const value = (part ?? 'GMT').replace('GMT', 'UTC')
  return value === 'UTC' ? 'UTC+00:00' : value
}

/** "Thailand (UTC+07:00 Bangkok)" */
export function regionLabel(region: (typeof REGIONS)[number]) {
  const city = region.timezone.split('/').pop()?.replace(/_/g, ' ')
  return `${region.country} (${utcOffset(region.timezone)} ${city})`
}

/** ตัวอักษรย่อใน avatar จากชื่อที่แสดง เช่น "Thomas W." → "TW" */
export function initialsOf(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => [...word][0].toUpperCase())
  return letters.join('') || '?'
}

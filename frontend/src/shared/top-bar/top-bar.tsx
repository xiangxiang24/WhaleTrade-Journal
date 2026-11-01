import { Sunset } from 'lucide-react'
import Avatar from '../avatar/avatar'

type TopBarProps = {
  /** ชื่อที่แสดงของผู้ใช้ (displayName) แสดงในป้ายฝั่งขวา */
  displayName: string
  avatarUrl?: string
  /** วันที่ที่แสดง (ค่าเริ่มต้นคือวันนี้) */
  date?: Date
  /** รหัสภาษาสำหรับรูปแบบวันที่ (ค่าเริ่มต้น en-US → "Thursday, Oct 24") */
  locale?: string
}

// ข้อความประจำหน้าจอ (ยังไม่ผ่านระบบแปลภาษา)
const GREETING = 'A peaceful session'

// แถบบนสุดของทุกหน้าหลังเข้าสู่ระบบ ไม่มีพื้นหลังและไม่มี padding แนวนอนของตัวเอง (ระยะขอบหน้ามาจาก AppShell): ซ้าย = ข้อความต้อนรับ + วันที่ ขวา = ชื่อผู้ใช้ + avatar
export default function TopBar({ displayName, avatarUrl, date, locale = 'en-US' }: TopBarProps) {
  const today = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(date ?? new Date())

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 text-navy-700">
      <div className="flex min-w-0 items-center gap-3 text-[16px] leading-6">
        <Sunset size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
        <span className="truncate">{GREETING}</span>
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-pill bg-blue-200" />
        <time className="truncate" dateTime={(date ?? new Date()).toISOString().slice(0, 10)}>
          {today}
        </time>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="flex max-w-60 items-center gap-2 rounded-pill bg-blue-50 px-4 py-1.5 text-[15px] leading-6 font-semibold text-navy-700">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-pill bg-navy-700" />
          <span className="truncate">{displayName}</span>
        </span>
        <Avatar src={avatarUrl} className="size-11" />
      </div>
    </header>
  )
}

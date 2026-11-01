import { Coffee } from 'lucide-react'

// ข้อความตกแต่งคงที่ของหน้าจอ (database.md หัวข้อ 4) ยังไม่ผ่านระบบแปลภาษา
const BADGE = 'Safe Haven'
const SUBTITLE = 'Your reasons are right here. Grounded in patience, compounding with time.'
const QUICK_NOTE = 'Market feels noisy today? Take a deep breath'

// ไอคอนอากาศดี (พระอาทิตย์ + เมฆ) วาดเป็น SVG ใช้สีจาก token แทนอีโมจิตัวอักษร
function WeatherIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-8 shrink-0 min-[640px]:size-10">
      <circle cx="19" cy="18" r="9" className="fill-gold-400" />
      <path
        d="M14 38 C8 38 6 31 11 29 C11 23 19 21 22 26 C27 22 35 25 34 31 C40 31 41 38 35 38 Z"
        className="fill-surface stroke-blue-200"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ส่วนหัว: "Welcome back" + ป้ายสถานะ + คำเตือนใจ (ซ้าย) / กล่องข้อความฮีลใจ (ขวา)
export default function JournalHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="m-0 text-[30px] leading-10 font-bold text-navy-900 min-[640px]:text-[36px] min-[640px]:leading-11 min-[1280px]:text-[48px] min-[1280px]:leading-14">
            Welcome back
          </h1>
          <WeatherIcon />
          <span className="rounded-pill bg-blue-100 px-3 py-1 text-[12px] leading-4 font-medium text-navy-700">
            {BADGE}
          </span>
        </div>
        <p className="m-0 mt-2 max-w-170 text-[15px] leading-6 text-navy-700 min-[640px]:text-[18px] min-[640px]:leading-7 min-[1280px]:text-[22px] min-[1280px]:leading-8">
          {SUBTITLE}
        </p>
      </div>

      <p className="m-0 inline-flex max-w-full items-center gap-3 rounded-2xl bg-surface px-5 py-3 text-[13px] leading-5 text-navy-900 shadow-md min-[640px]:rounded-pill min-[640px]:px-6 min-[640px]:text-[14px]">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-pill bg-navy-700" />
        {QUICK_NOTE}
        <Coffee size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-navy-700" />
      </p>
    </div>
  )
}

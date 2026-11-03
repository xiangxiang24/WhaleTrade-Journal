import { Heart, Sprout } from 'lucide-react'
import { useI18n } from '../../shared/i18n/use-i18n'

// ข้อความตกแต่งคงที่ของหน้าจอ (database.md หัวข้อ 4) ยังไม่ผ่านระบบแปลภาษา
const TITLE = 'Roots grow quietly beneath the surface'
const TEXT = 'Quiet markets cultivate resilience. No immediate trade actions needed today.'
const STATUS = 'Mindful discipline active'

// แบนเนอร์แนวคิดการลงทุนระยะยาว: ไอคอน + ข้อความ (ซ้าย) / ป้ายสถานะ (ขวา)
export default function CalmBanner() {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-3xl bg-surface px-5 py-4 shadow-md min-[640px]:px-6">
      <span
        aria-hidden="true"
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-pill bg-blue-100 text-navy-700"
      >
        <Sprout size={22} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 basis-60">
        <p className="m-0 text-[17px] leading-6 font-bold text-navy-900 min-[640px]:text-[18px]">{t(TITLE)}</p>
        <p className="m-0 text-[13px] leading-5 text-text-muted">{t(TEXT)}</p>
      </div>
      <p className="m-0 inline-flex items-center gap-2 text-[13px] leading-5 font-semibold text-navy-700">
        <Heart size={18} strokeWidth={1.75} aria-hidden="true" />
        {t(STATUS)}
      </p>
    </div>
  )
}

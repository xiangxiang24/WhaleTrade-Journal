import { Library, Plus } from 'lucide-react'
import { useI18n } from '../../shared/i18n/use-i18n'

type PlanHeaderProps = {
  /** จำนวนแผนที่บันทึกไว้ (null = กำลังโหลด) */
  count: number | null
  onNewPlan: () => void
}

// ข้อความตกแต่งคงที่ของหน้าจอ (ยังไม่ผ่านระบบแปลภาษา)
const TAG = 'Personal vault'
const TITLE = 'Saved Plans'
const SUBTITLE = 'Your plans, kept safe for whenever you want to revisit or calibrate your horizon.'

// ส่วนหัว: ป้าย Personal Vault / ชื่อหน้า + คำโปรย (ซ้าย) / ป้ายจำนวนแผน + ปุ่ม New plan (ขวา)
export default function PlanHeader({ count, onNewPlan }: PlanHeaderProps) {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0 flex-1 basis-80">
        <p className="m-0 flex items-center gap-2 text-[11px] leading-4 font-semibold tracking-[0.08em] text-navy-700 uppercase">
          <Library size={14} strokeWidth={1.75} aria-hidden="true" />
          {t(TAG)}
        </p>
        <h1 className="m-0 mt-1 text-[30px] leading-10 font-bold text-navy-900 min-[640px]:text-[36px] min-[640px]:leading-11 min-[1280px]:text-[40px] min-[1280px]:leading-12">
          {t(TITLE)}
        </h1>
        <p className="m-0 mt-1 max-w-190 text-[15px] leading-6 text-navy-700 min-[640px]:text-[17px] min-[640px]:leading-7 min-[1280px]:text-[18px]">
          {t(SUBTITLE)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 max-[639px]:w-full">
        {count !== null && (
          <span className="inline-flex h-10 items-center rounded-pill bg-blue-100 px-4 text-[14px] leading-5 font-semibold text-navy-700">
            {t(count === 1 ? '{n} saved plan' : '{n} saved plans', { n: count })}
          </span>
        )}
        <button
          type="button"
          onClick={onNewPlan}
          className="inline-flex h-10 items-center gap-2 rounded-pill border-2 border-blue-500 bg-surface px-5 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100 max-[639px]:flex-1 max-[639px]:justify-center"
        >
          <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
          {t('New plan')}
        </button>
      </div>
    </div>
  )
}

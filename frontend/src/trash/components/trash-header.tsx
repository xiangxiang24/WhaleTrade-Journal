import { Trash2 } from 'lucide-react'
import { useI18n } from '../../shared/i18n/use-i18n'

type TrashHeaderProps = {
  /** จำนวนรายการในถังขยะทั้งหมด (null = กำลังโหลด) */
  count: number | null
}

// ส่วนหัว: ป้าย / ชื่อหน้า + คำโปรย (ซ้าย) / ป้ายจำนวนรายการทั้งหมด (ขวา)
export default function TrashHeader({ count }: TrashHeaderProps) {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0 flex-1 basis-80">
        <p className="m-0 flex items-center gap-2 text-[11px] leading-4 font-semibold tracking-[0.08em] text-navy-700 uppercase">
          <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
          {t('Recycle bin')}
        </p>
        <h1 className="m-0 mt-1 text-[30px] leading-10 font-bold text-navy-900 min-[640px]:text-[36px] min-[640px]:leading-11 min-[1280px]:text-[40px] min-[1280px]:leading-12">
          {t('Trash')}
        </h1>
        <p className="m-0 mt-1 max-w-190 text-[15px] leading-6 text-navy-700 min-[640px]:text-[17px] min-[640px]:leading-7 min-[1280px]:text-[18px]">
          {t('Journals and portfolios you deleted. Restore them or delete them for good.')}
        </p>
      </div>
      {count !== null && (
        <span className="inline-flex h-10 items-center rounded-pill bg-blue-100 px-4 text-[14px] leading-5 font-semibold text-navy-700">
          {t(count === 1 ? '{n} item in trash' : '{n} items in trash', { n: count })}
        </span>
      )}
    </div>
  )
}

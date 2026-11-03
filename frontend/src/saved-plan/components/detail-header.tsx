import { ArrowLeft, CalendarDays, Cloud, FileDown, ImageDown, Pencil, Download, Trash2 } from 'lucide-react'
import type { CalcPlan } from '../../shared/types/calc-plan'
import { formatSavedDate, formatYears, planSource, planYears } from '../types/saved-plan'
import { useI18n } from '../../shared/i18n/use-i18n'

type DetailHeaderProps = {
  plan: CalcPlan
  names: Map<number, string>
  timeZone: string
  /** กำลังสร้างไฟล์รูป */
  exportingImage: boolean
  onBack: () => void
  onRename: () => void
  onDelete: () => void
  onExport: (kind: 'CSV' | 'PDF' | 'image') => void
}

const CHIP = 'inline-flex max-w-full items-center gap-2 rounded-pill bg-blue-100 px-3 py-1 text-[13px] leading-5 font-semibold text-navy-700'
const OUTLINE =
  'inline-flex h-11 items-center gap-2 rounded-pill border-2 border-blue-500 bg-surface px-5 text-[14px] leading-5 font-semibold whitespace-nowrap text-navy-700 transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100 disabled:border-blue-200 disabled:text-text-muted disabled:opacity-60 max-[639px]:flex-1 max-[639px]:justify-center'

// ส่วนหัวของหน้าสรุปแผน: ปุ่มกลับ / ป้ายแหล่งที่มา + วันที่ + ระยะเวลา / ชื่อแผน + ปุ่มเปลี่ยนชื่อ / ปุ่ม Export + Delete
export default function DetailHeader({
  plan,
  names,
  timeZone,
  exportingImage,
  onBack,
  onRename,
  onDelete,
  onExport,
}: DetailHeaderProps) {
  const { t, locale } = useI18n()
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-10 items-center gap-2 rounded-pill bg-surface px-4 text-[14px] leading-5 font-medium text-navy-700 shadow-md transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100"
      >
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        {t('Back to Saved Plans')}
      </button>

      <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
        <li className={CHIP}>
          <Cloud size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{planSource(plan, names, t)}</span>
        </li>
        <li className={CHIP}>
          <CalendarDays size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <span>
            {t('Saved')} <time dateTime={plan.savedAt}>{formatSavedDate(plan.savedAt, timeZone, locale)}</time>
          </span>
        </li>
        <li className={CHIP}>{formatYears(planYears(plan), t)}</li>
      </ul>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1 basis-80">
          <h1 className="m-0 flex flex-wrap items-center gap-x-2 text-[30px] leading-10 font-bold text-navy-900 min-[640px]:text-[36px] min-[640px]:leading-11 min-[1280px]:text-[40px] min-[1280px]:leading-12">
            <span className="min-w-0 break-words">{plan.name}</span>
            <button
              type="button"
              onClick={onRename}
              aria-label={t('Rename {name}', { name: plan.name })}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill text-navy-700 hover:bg-blue-100 active:bg-blue-100"
            >
              <Pencil size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </h1>
          <p className="m-0 mt-1 text-[15px] leading-6 text-navy-700 min-[640px]:text-[16px]">
            {t('Recalculated from your saved inputs. A calm look at where this plan can lead.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 max-[639px]:w-full">
          <button type="button" onClick={() => onExport('CSV')} className={OUTLINE}>
            <Download size={16} strokeWidth={1.75} aria-hidden="true" />
            {t('Export CSV')}
          </button>
          <button type="button" onClick={() => onExport('image')} disabled={exportingImage} className={OUTLINE}>
            <ImageDown size={16} strokeWidth={1.75} aria-hidden="true" />
            {exportingImage ? t('Creating…') : t('Export image')}
          </button>
          <button type="button" onClick={() => onExport('PDF')} className={OUTLINE}>
            <FileDown size={16} strokeWidth={1.75} aria-hidden="true" />
            {t('Export PDF')}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-11 items-center gap-2 rounded-pill border-2 border-red-500 bg-surface px-5 text-[14px] leading-5 font-semibold text-red-500 transition-colors duration-150 hover:bg-red-50 active:bg-red-500 active:text-surface max-[639px]:flex-1 max-[639px]:justify-center"
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
            {t('Delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

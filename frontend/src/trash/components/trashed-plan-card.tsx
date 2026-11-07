import { Trash2 } from 'lucide-react'
import type { TrashedCalcPlan } from '../../shared/types/calc-plan'
import { formatUpdated } from '../../portfolio/types/format'
import { formatBaht } from '../../target-amount/types/format'
import { formatSavedDate, formatYears, planSource, planYears } from '../../saved-plan/types/saved-plan'
import { useI18n } from '../../shared/i18n/use-i18n'
import CardActions from './card-actions'

type TrashedPlanCardProps = {
  plan: TrashedCalcPlan
  /** ชื่อพอร์ตทั้งหมด (id → ชื่อ) ใช้บอกแหล่งที่มาของแผน */
  names: Map<number, string>
  timeZone: string
  onRestore: (plan: TrashedCalcPlan) => void
  onDelete: (plan: TrashedCalcPlan) => void
}

const CHIP = 'inline-flex max-w-full items-center rounded-pill bg-blue-50 px-3 py-1 text-[12px] leading-4 text-navy-700'

// การ์ดแผนในถังขยะ: จางและเปิดดูไม่ได้ มีแค่กู้คืน / ลบถาวร
export default function TrashedPlanCard({ plan, names, timeZone, onRestore, onDelete }: TrashedPlanCardProps) {
  const { t, locale } = useI18n()

  return (
    <article
      aria-label={plan.name}
      className="flex h-full flex-col rounded-3xl border-2 border-dashed border-blue-200 bg-surface p-5 shadow-sm"
    >
      <div className="mb-4 opacity-70">
        <h2 className="m-0 line-clamp-2 text-[18px] leading-6 font-bold break-words text-navy-900">{plan.name}</h2>
        <p className="m-0 text-[13px] leading-5 text-text-muted">
          {t('Saved')} <time dateTime={plan.savedAt}>{formatSavedDate(plan.savedAt, timeZone, locale)}</time>
        </p>
        <p className="m-0 mt-3 text-[12px] leading-4 text-text-muted">{t('Expected amount')}</p>
        <p className="m-0 mt-1 text-[24px] leading-8 font-bold whitespace-nowrap text-navy-900 tabular-nums">
          {formatBaht(plan.resultAmount)} <span className="text-[0.5em] font-semibold text-text-muted">{t('THB')}</span>
        </p>
        <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
          <li className={CHIP}>{formatYears(planYears(plan), t)}</li>
          <li className={`${CHIP} min-w-0`}>
            <span className="truncate">{planSource(plan, names, t)}</span>
          </li>
        </ul>
      </div>

      <dl className="m-0 mt-auto flex flex-col gap-1 border-t border-line pt-3 text-[12px] leading-4 text-text-muted">
        <div className="flex items-center gap-1.5">
          <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <dt>{t('Deleted')}</dt>
          <dd className="m-0">
            <time dateTime={plan.deletedAt}>{formatUpdated(plan.deletedAt, timeZone, locale)}</time>
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <CardActions name={plan.name} onRestore={() => onRestore(plan)} onDelete={() => onDelete(plan)} />
      </div>
    </article>
  )
}

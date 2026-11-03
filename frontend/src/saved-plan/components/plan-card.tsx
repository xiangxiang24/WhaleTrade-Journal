import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import CardMenu from '../../portfolio/components/card-menu'
import type { CalcPlan } from '../../shared/types/calc-plan'
import { formatBaht } from '../../target-amount/types/format'
import { formatSavedDate, formatYears, planSource, planYears } from '../types/saved-plan'
import { useI18n } from '../../shared/i18n/use-i18n'

type PlanCardProps = {
  plan: CalcPlan
  names: Map<number, string>
  timeZone: string
  onOpen: (id: number) => void
  onRename: (plan: CalcPlan) => void
  onDelete: (plan: CalcPlan) => void
}

const CHIP = 'inline-flex max-w-full items-center rounded-pill bg-blue-50 px-3 py-1 text-[12px] leading-4 text-navy-700'

// การ์ดแผน: ชื่อ + วันที่บันทึก + เมนู / Expected amount / ป้ายระยะเวลา + แหล่งที่มา / ปุ่ม Delete + Open
export default function PlanCard({ plan, names, timeZone, onOpen, onRename, onDelete }: PlanCardProps) {
  const { t, locale } = useI18n()
  // ยก z-index ของการ์ดที่เมนูเปิดอยู่ เพื่อไม่ให้การ์ดข้างเคียงทับเมนู
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <article
      aria-label={plan.name}
      className={`relative flex h-full flex-col rounded-4xl bg-surface p-5 shadow-md transition-[box-shadow,translate] duration-300 ease-soft hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 min-[640px]:p-6 ${
        menuOpen ? 'z-10' : ''
      }`}
    >
      <header className="flex items-start gap-3 border-b border-line pb-4">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 line-clamp-2 text-[18px] leading-6 font-bold break-words text-navy-900">{plan.name}</h2>
          <p className="m-0 text-[13px] leading-5 text-text-muted">
            {t('Saved')} <time dateTime={plan.savedAt}>{formatSavedDate(plan.savedAt, timeZone, locale)}</time>
          </p>
        </div>
        <CardMenu
          portfolioName={plan.name}
          editLabel={t('Rename plan')}
          trashLabel={t('Delete plan')}
          onOpenChange={setMenuOpen}
          onEdit={() => onRename(plan)}
          onTrash={() => onDelete(plan)}
        />
      </header>

      <div className="mt-4">
        <p className="m-0 text-[12px] leading-4 text-text-muted">{t('Expected amount')}</p>
        <p className="m-0 mt-1 text-[28px] leading-9 font-bold whitespace-nowrap text-navy-900 tabular-nums">
          {formatBaht(plan.resultAmount)} <span className="text-[0.5em] font-semibold text-text-muted">{t('THB')}</span>
        </p>
        <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
          <li className={CHIP}>{formatYears(planYears(plan), t)}</li>
          <li className={`${CHIP} min-w-0`}>
            <span className="truncate">{planSource(plan, names, t)}</span>
          </li>
        </ul>
      </div>

      <footer className="mt-auto flex flex-wrap items-center justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={() => onDelete(plan)}
          aria-label={t('Delete {name}', { name: plan.name })}
          className="inline-flex h-10 items-center rounded-pill border-2 border-red-500 bg-surface px-4 text-[14px] leading-5 font-semibold text-red-500 transition-colors duration-150 hover:bg-red-50 active:bg-red-500 active:text-surface"
        >
          {t('Delete')}
        </button>
        <button
          type="button"
          onClick={() => onOpen(plan.id)}
          aria-label={t('Open {name}', { name: plan.name })}
          className="inline-flex h-10 items-center gap-1 rounded-pill bg-blue-500 pr-3 pl-5 text-[15px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900"
        >
          {t('Open')}
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </footer>
    </article>
  )
}

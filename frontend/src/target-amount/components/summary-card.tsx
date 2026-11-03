import { Calculator, ListChecks } from 'lucide-react'
import { formatBaht, formatCompact } from '../types/format'
import type { Calculator as CalculatorState } from '../types/use-calculator'
import { useI18n } from '../../shared/i18n/use-i18n'

// ข้อความคงที่ของหน้าจอ
const FOOT = 'Takes less than a second · Preserves your data'

// การ์ด Sanctuary Summary: ค่าจากฟอร์มทันที (ยังไม่ต้องกด Calculate) + ปุ่ม Calculate / Recalculate
// ≥ 1280 = การ์ดแนวตั้งทางขวาที่ติดอยู่กับที่ตอนเลื่อน; น้อยกว่านั้นย้ายขึ้นบนเป็นแถบสรุปแนวนอน (design rules 5.2)
export default function SummaryCard({ calc, onCalculate }: { calc: CalculatorState; onCalculate: () => void }) {
  const { t } = useI18n()
  const { summary, result, stale } = calc
  const label = result ? t('Recalculate') : t('Calculate')
  const phaseNote =
    calc.phasesOn && summary.phaseDca.length > 1
      ? summary.phaseDca.map((value, index) => `${t('Phase {n}', { n: index + 1 })}: ${formatCompact(value)}`).join(' + ')
      : null

  const item = 'flex min-w-0 flex-col gap-0.5 min-[1280px]:flex-row min-[1280px]:items-start min-[1280px]:justify-between min-[1280px]:gap-3'
  const term = 'text-[12px] leading-4 text-text-muted'
  const value = 'text-[16px] leading-6 font-bold text-navy-900 tabular-nums min-[1280px]:text-right'

  return (
    <aside aria-label={t('Sanctuary summary')} className="rounded-4xl bg-parchment p-5 shadow-md min-[1280px]:sticky min-[1280px]:top-2 min-[640px]:p-6">
      <p className="m-0 flex items-center gap-2 text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase">
        <ListChecks size={14} strokeWidth={1.75} aria-hidden="true" />
        {t('Sanctuary summary')}
      </p>
      <h2 className="m-0 mt-1 text-[20px] leading-7 font-bold text-navy-900">{t('Your plan so far')}</h2>

      <dl className="m-0 mt-4 grid grid-cols-2 gap-x-4 gap-y-4 min-[640px]:grid-cols-4 min-[1280px]:grid-cols-1">
        <div className={item}>
          <dt className={term}>{t('Initial principal')}</dt>
          <dd className={`m-0 ${value}`}>
            {formatBaht(summary.principal)} <span className="text-[0.75em] text-text-muted">{t('THB')}</span>
          </dd>
        </div>
        <div className={item}>
          <dt className={term}>{t('Total DCA per phase')}</dt>
          <dd className={`m-0 ${value}`}>
            {formatBaht(summary.totalDca)} <span className="text-[0.75em] text-text-muted">{t('THB')}</span>
            {phaseNote && <span className="block text-[11px] leading-4 font-normal text-text-muted">{phaseNote}</span>}
          </dd>
        </div>
        <div className={item}>
          <dt className={term}>{t('Duration')}</dt>
          <dd className={`m-0 ${value}`}>
            {t(summary.totalYears === 1 ? '{n} year' : '{n} years', { n: summary.totalYears })}
          </dd>
        </div>
        <div className={item}>
          <dt className={term}>{t('Dividend % applied')}</dt>
          <dd className={`m-0 ${value}`}>{summary.avgYield === null ? '—' : t('Avg {percent}%', { percent: summary.avgYield.toFixed(2) })}</dd>
        </div>
      </dl>

      <div className="mt-5 rounded-2xl bg-surface px-4 py-3 min-[640px]:flex min-[640px]:items-center min-[640px]:justify-between min-[640px]:gap-4 min-[1280px]:block">
        <p className="m-0 text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase">{t('Total invested capital')}</p>
        <p className="m-0 mt-1 text-[24px] leading-8 font-bold text-navy-900 tabular-nums min-[640px]:mt-0">
          {formatBaht(summary.totalInvested)} <span className="text-[0.6em] text-text-muted">{t('THB')}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={onCalculate}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-blue-500 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900"
      >
        <Calculator size={18} strokeWidth={1.75} aria-hidden="true" />
        {label}
      </button>
      <p className="m-0 mt-3 text-center text-[12px] leading-5 text-text-muted">
        {stale ? t('Your inputs changed since the last result.') : t(FOOT)}
      </p>
    </aside>
  )
}

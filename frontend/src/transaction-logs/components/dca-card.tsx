import { PiggyBank } from 'lucide-react'
import type { DcaPoint } from '../../shared/data/portfolio-math'
import { formatBaht, formatMonthShort } from '../types/format'
import Sparkline from './sparkline'
import { useI18n } from '../../shared/i18n/use-i18n'

type DcaCardProps = {
  total: number
  depositMonths: number
  series: DcaPoint[]
}

const OVERLINE = 'text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase'

// การ์ด Total Recorded DCA: ยอดรวมต้นทุนรายการซื้อ / จำนวนเดือนที่ซื้อ / กราฟยอดสะสม + ช่วงเวลา
export default function DcaCard({ total, depositMonths, series }: DcaCardProps) {
  const { t, locale } = useI18n()
  const first = series[0]?.month
  const last = series[series.length - 1]?.month

  return (
    <section aria-label={t('Total recorded DCA')} className="flex flex-col rounded-4xl bg-surface p-5 shadow-md min-[640px]:p-6">
      <header className="flex items-start justify-between gap-2">
        <h2 className={`m-0 ${OVERLINE}`}>{t('Total recorded DCA')}</h2>
        <span
          aria-hidden="true"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-blue-100 text-navy-700"
        >
          <PiggyBank size={16} strokeWidth={1.75} />
        </span>
      </header>

      <p className="m-0 mt-3 text-[28px] leading-9 font-bold whitespace-nowrap text-navy-900 tabular-nums min-[640px]:text-[32px] min-[640px]:leading-10">
        {formatBaht(total)}
        <span className="ml-2 text-[0.5em] font-semibold text-text-muted">{t('THB')}</span>
      </p>
      <p className="m-0 mt-2 flex items-center gap-2 text-[13px] leading-5 text-navy-700">
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-pill bg-blue-500" />
        {depositMonths === 0
          ? t('No monthly deposits yet')
          : t(depositMonths === 1 ? 'Across {n} monthly deposit' : 'Across {n} monthly deposits', { n: depositMonths })}
      </p>

      <div className="mt-auto pt-5">
        {series.length > 0 ? (
          <>
            <Sparkline points={series} label={t('Cumulative DCA from {from} to {to}', { from: formatMonthShort(first, locale), to: formatMonthShort(last, locale) })} />
            <div className="mt-1 flex justify-between gap-2 text-[12px] leading-4 text-text-muted">
              <span>{formatMonthShort(first, locale)}</span>
              <span>{formatMonthShort(last, locale)}</span>
            </div>
          </>
        ) : (
          <p className="m-0 text-[12px] leading-5 text-text-muted">{t('Record a Buy transaction to see your DCA trend.')}</p>
        )}
      </div>
    </section>
  )
}

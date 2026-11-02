import { Info } from 'lucide-react'
import { formatBaht, formatPercent } from '../types/format'
import type { CalcResult } from '../types/target-amount'

const DISCLAIMER =
  'This projection is an illustrative model based on the stated recurring deposits and regular yield reinvestment. It is an educational estimate, not a forecast or guarantee of actual investment returns.'

type Row = { dot: string; label: string; value: string }

// สัดส่วนเงินต้น/DCA/ปันผล (แถบ + คำอธิบายสี) + ตารางสรุปยอด + ข้อความเตือน
export default function ProportionCard({ result }: { result: CalcResult }) {
  const { output, input, assets } = result
  const { shares } = output
  const single = input.phases.length === 1

  const rows: Row[] = [
    { dot: 'bg-blue-200', label: 'Initial principal', value: `${formatBaht(input.principal)} THB` },
    ...input.phases.map((phase, index) => ({
      dot: 'bg-blue-500',
      label: `DCA — ${single ? '' : `Phase ${index + 1} `}(${phase.years} ${phase.years === 1 ? 'year' : 'years'} × ${formatBaht(phase.monthlyDca)} THB/month)`,
      value: `${formatBaht(output.phaseTotals[index] ?? 0)} THB`,
    })),
    { dot: 'bg-green-500', label: 'Expected dividends (reinvested)', value: `+${formatBaht(output.dividends)} THB` },
  ]

  const legend = [
    { dot: 'bg-blue-200', label: 'Initial Principal', pct: shares.principal },
    { dot: 'bg-blue-500', label: 'DCA Deposits', pct: shares.dca },
    { dot: 'bg-green-500', label: 'Compounded Dividends', pct: shares.dividends },
  ]

  return (
    <section aria-label="Capital and dividend proportion" className="rounded-4xl bg-surface p-5 shadow-md min-[640px]:p-8">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h3 className="m-0 text-[20px] leading-7 font-bold text-navy-900">Capital &amp; Dividend Proportion</h3>
          <p className="m-0 text-[13px] leading-5 text-text-muted">
            See how your own deposits compare to passive compound dividend distributions.
          </p>
        </div>
        <ul aria-label="Dividend yield per stock" className="m-0 flex list-none flex-wrap gap-2 p-0">
          {assets.map((asset) => (
            <li key={asset.assetId} className="rounded-pill bg-blue-50 px-3 py-1 text-[12px] leading-4 font-semibold text-navy-700 tabular-nums">
              {asset.ticker}: {asset.dividendPct}%
            </li>
          ))}
        </ul>
      </header>

      <div
        role="img"
        aria-label={`Initial principal ${formatPercent(shares.principal)}, DCA deposits ${formatPercent(shares.dca)}, compounded dividends ${formatPercent(shares.dividends)}`}
        className="mt-5 flex h-3 overflow-hidden rounded-pill bg-blue-100"
      >
        <span className="bg-blue-200" style={{ width: `${shares.principal}%` }} />
        <span className="bg-blue-500" style={{ width: `${shares.dca}%` }} />
        <span className="bg-green-500" style={{ width: `${shares.dividends}%` }} />
      </div>
      <ul className="m-0 mt-3 flex list-none flex-wrap justify-between gap-x-6 gap-y-2 p-0 text-[12px] leading-4 text-navy-700">
        {legend.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span aria-hidden="true" className={`size-2 rounded-pill ${item.dot}`} />
            {item.label} ({formatPercent(item.pct)})
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-3xl bg-blue-50 p-4 min-[640px]:p-6">
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {rows.map((row) => (
            <li key={row.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[14px] leading-6 text-navy-900">
              <span className="flex min-w-0 items-center gap-3">
                <span aria-hidden="true" className={`size-2 shrink-0 rounded-pill ${row.dot}`} />
                <span className="min-w-0 break-words">{row.label}</span>
              </span>
              <span className="font-semibold whitespace-nowrap tabular-nums">{row.value}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-blue-200 pt-4">
          <span className="text-[15px] leading-6 font-bold text-navy-900">Total Estimated Value</span>
          <span className="text-[22px] leading-8 font-bold whitespace-nowrap text-navy-700 tabular-nums min-[640px]:text-[26px]">
            {formatBaht(output.total)} THB
          </span>
        </div>
      </div>

      <p className="m-0 mt-5 flex items-start gap-3 rounded-2xl bg-parchment px-4 py-3 text-[12px] leading-5 text-navy-700">
        <Info size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0" />
        {DISCLAIMER}
      </p>
    </section>
  )
}

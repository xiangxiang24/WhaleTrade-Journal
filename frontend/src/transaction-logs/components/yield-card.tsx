import { Droplet, TrendingUp } from 'lucide-react'
import { SET_INDEX_AVG_YIELD } from '../types/transaction-logs'

const OVERLINE = 'text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase'

// การ์ด Avg. Yield on Cost + เทียบค่าเฉลี่ยตลาด SET (ค่าคงที่ในแอป) ยังไม่มีหุ้นที่ถืออยู่ = "—"
export default function YieldCard({ yieldPct }: { yieldPct: number | null }) {
  const spread = yieldPct === null ? null : yieldPct - SET_INDEX_AVG_YIELD

  return (
    <section aria-label="Average yield on cost" className="flex flex-col rounded-4xl bg-surface p-5 shadow-md min-[640px]:p-6">
      <header className="flex items-start justify-between gap-2">
        <h2 className={`m-0 ${OVERLINE}`}>Avg. yield on cost</h2>
        <span
          aria-hidden="true"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-blue-100 text-navy-700"
        >
          <Droplet size={16} strokeWidth={1.75} />
        </span>
      </header>

      <p className="m-0 mt-3 text-[28px] leading-9 font-bold text-navy-900 tabular-nums min-[640px]:text-[32px] min-[640px]:leading-10">
        {yieldPct === null ? '—' : `${yieldPct.toFixed(2)}%`}
      </p>
      <p className="m-0 mt-2 flex items-center gap-2 text-[13px] leading-5 text-navy-700">
        <TrendingUp size={16} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
        {yieldPct === null ? 'Add a Buy to start tracking' : 'Steady growing cashflow'}
      </p>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl bg-blue-50 px-4 py-3 text-[12px] leading-4 text-navy-700">
          <span>
            SET Index avg: <span className="tabular-nums">~{SET_INDEX_AVG_YIELD.toFixed(1)}%</span>
          </span>
          {spread !== null && (
            <span className="font-semibold text-navy-900 tabular-nums">
              {spread >= 0 ? '+' : '−'}
              {Math.abs(spread).toFixed(2)}% spread
            </span>
          )}
        </div>
      </div>
    </section>
  )
}

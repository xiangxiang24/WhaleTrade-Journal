import { ASSET_BY_ID } from '../../shared/data/assets'
import type { CalcPlan } from '../../shared/types/calc-plan'
import { formatBaht } from '../../target-amount/types/format'
import { stageName } from '../../target-amount/types/target-amount'
import { formatYears } from '../types/saved-plan'

// การ์ด "Plan inputs": ค่าที่บันทึกไว้ในแผน (หุ้น + ปันผล % ต่อปี และแต่ละเฟส) ไว้ดูประกอบผล
export default function InputsCard({ plan }: { plan: CalcPlan }) {
  return (
    <section aria-label="Plan inputs" className="rounded-4xl bg-surface p-5 shadow-md min-[640px]:p-8">
      <h3 className="m-0 text-[20px] leading-7 font-bold text-navy-900">Plan inputs</h3>
      <p className="m-0 text-[13px] leading-5 text-text-muted">The numbers this estimate was calculated from.</p>

      <h4 className="m-0 mt-5 text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase">
        Stocks &amp; dividend yield
      </h4>
      <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
        {plan.assets.map((asset) => {
          const info = ASSET_BY_ID.get(asset.assetId)
          return (
            <li key={asset.assetId} className="flex items-center gap-3 rounded-3xl bg-blue-50 px-4 py-3">
              <span
                aria-hidden="true"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-blue-100 px-1 text-[10px] leading-4 font-bold text-navy-700"
              >
                {info?.ticker.slice(0, 5)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] leading-5 font-bold break-words text-navy-900">{info?.name ?? 'Unknown asset'}</span>
                <span className="block text-[12px] leading-4 text-text-muted">
                  {info ? `${info.ticker} · ${info.market}${info.sector ? ` · ${info.sector}` : ''}` : '—'}
                </span>
              </span>
              <span className="shrink-0 text-[16px] leading-6 font-bold text-navy-900 tabular-nums">{asset.dividendPct}%</span>
            </li>
          )
        })}
      </ul>

      <h4 className="m-0 mt-5 text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase">
        {plan.phases.length > 1 ? 'Phases' : 'Contribution'}
      </h4>
      <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
        {plan.phases.map((phase, index) => (
          <li key={index} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-3xl bg-blue-50 px-4 py-3">
            <span
              aria-hidden="true"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill bg-navy-700 text-[12px] leading-4 font-bold text-surface"
            >
              P{index + 1}
            </span>
            <span className="min-w-0 flex-1 basis-32">
              <span className="block text-[14px] leading-5 font-semibold text-navy-900">
                {plan.phases.length > 1 ? `Phase ${index + 1}` : 'Monthly DCA'}
              </span>
              {plan.phases.length > 1 && <span className="block text-[12px] leading-4 text-text-muted">{stageName(index)}</span>}
            </span>
            <span className="text-[14px] leading-5 font-semibold whitespace-nowrap text-navy-900 tabular-nums">
              {formatYears(phase.years)} × {formatBaht(phase.monthlyDca)} THB/month
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

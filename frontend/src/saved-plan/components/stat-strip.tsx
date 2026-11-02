import type { CalcResult } from '../../target-amount/types/target-amount'
import { formatBaht } from '../../target-amount/types/format'
import { formatYears } from '../types/saved-plan'

const LABEL = 'm-0 text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase'
const VALUE = 'm-0 mt-1 text-[22px] leading-8 font-bold whitespace-nowrap text-navy-900 tabular-nums'
const UNIT = 'text-[0.6em] font-semibold text-text-muted'

// แถบสรุป 4 ช่อง: เงินต้น / DCA รวม / ระยะเวลา / ปันผลเฉลี่ย (2 คอลัมน์บนจอเล็ก, 4 คอลัมน์ตั้งแต่ 1024)
export default function StatStrip({ result }: { result: CalcResult }) {
  const { output, input } = result
  const items = [
    { label: 'Initial principal', value: formatBaht(input.principal), unit: 'THB' },
    { label: 'Total DCA', value: formatBaht(output.totalDca), unit: 'THB' },
    { label: 'Duration', value: formatYears(output.years) },
    { label: 'Avg dividend yield', value: `${result.avgYieldPct.toFixed(2)}%` },
  ]
  return (
    <dl className="m-0 grid grid-cols-2 gap-3 min-[1024px]:grid-cols-4 min-[1280px]:gap-4">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-3xl bg-surface p-4 shadow-md min-[640px]:p-5">
          <dt className={LABEL}>{item.label}</dt>
          <dd className={VALUE}>
            {item.value} {item.unit && <span className={UNIT}>{item.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

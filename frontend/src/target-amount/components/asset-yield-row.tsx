import { X } from 'lucide-react'
import type { AssetRow } from '../types/target-amount'

type AssetYieldRowProps = {
  row: AssetRow
  onYieldChange: (text: string) => void
  onRemove: () => void
}

// ปันผลพิมพ์ได้เฉพาะตัวเลขกับจุดทศนิยม 1 จุด (เช่น 7.1)
const sanitize = (text: string) => {
  const cleaned = text.replace(/[^\d.]/g, '')
  const [whole, ...rest] = cleaned.split('.')
  return (rest.length > 0 ? `${whole}.${rest.join('')}` : whole).slice(0, 5)
}

// แถวหุ้น/กองทุน: ตัวย่อ + ชื่อ + ตลาด · หมวด / ช่องปันผล % ต่อปี + ปุ่มเอาออก
export default function AssetYieldRow({ row, onYieldChange, onRemove }: AssetYieldRowProps) {
  const { asset } = row
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-3xl bg-blue-50 px-4 py-3">
      <span
        aria-hidden="true"
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-pill bg-blue-100 px-1 text-[11px] leading-4 font-bold text-navy-700"
      >
        {asset.ticker.slice(0, 5)}
      </span>
      <div className="min-w-0 flex-1 basis-40">
        <p className="m-0 text-[14px] leading-5 font-bold break-words text-navy-900">{asset.name}</p>
        <p className="m-0 text-[12px] leading-4 text-text-muted">
          {asset.ticker} · {asset.market}
          {asset.sector ? ` · ${asset.sector}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <label className="flex items-center gap-1.5">
          <span className="sr-only">Dividend yield per year for {asset.ticker}</span>
          <input
            inputMode="decimal"
            autoComplete="off"
            value={row.yieldText}
            placeholder="0.0"
            onChange={(event) => onYieldChange(sanitize(event.target.value))}
            className="h-10 w-20 rounded-pill border-2 border-blue-500 bg-surface px-3 text-right text-[14px] text-navy-900 tabular-nums outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus"
          />
          <span aria-hidden="true" className="text-[13px] font-semibold text-text-muted">
            %
          </span>
        </label>
        <button
          type="button"
          aria-label={`Remove ${asset.ticker}`}
          onClick={onRemove}
          className="group/icon inline-flex size-9 items-center justify-center rounded-pill text-navy-700 hover:text-red-500"
        >
          <X
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
            className="transition-[stroke-width] duration-150 group-hover/icon:stroke-[2.5]"
          />
        </button>
      </div>
    </li>
  )
}

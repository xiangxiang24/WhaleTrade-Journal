import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { Holding } from '../../shared/data/portfolio-math'
import { formatDecimal } from '../types/format'

const ARROW =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-pill text-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:text-blue-200 disabled:hover:bg-transparent'

// แถบ Holdings: การ์ด ticker + จำนวนหน่วย เรียงแนวนอน เลื่อนด้วยลูกศร (ปิดปุ่มเมื่อสุดทาง) หรือเลื่อนนิ้ว/ล้อเมาส์ได้
export default function HoldingsStrip({ holdings }: { holdings: Holding[] }) {
  const scroller = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  const measure = useCallback(() => {
    const el = scroller.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 })
  }, [])

  useEffect(() => {
    measure()
    const el = scroller.current
    if (!el) return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measure, holdings.length])

  function scrollByPage(direction: 1 | -1) {
    const el = scroller.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section aria-label="Holdings" className="rounded-4xl bg-surface p-5 shadow-md min-[640px]:p-6">
      <h2 className="m-0 text-[14px] leading-5 font-semibold tracking-[0.08em] text-navy-900 uppercase">Holdings</h2>

      {holdings.length === 0 ? (
        <p className="m-0 mt-3 text-[14px] leading-6 text-text-muted">
          No holdings yet. Stocks and funds you buy will appear here with the units you still hold.
        </p>
      ) : (
        <div className="mt-3 flex items-center gap-1 min-[640px]:gap-2">
          <button type="button" aria-label="Scroll holdings left" disabled={edges.start} onClick={() => scrollByPage(-1)} className={ARROW}>
            <ChevronsLeft size={22} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <ul
            ref={scroller}
            onScroll={measure}
            className="no-scrollbar m-0 flex min-w-0 flex-1 snap-x list-none gap-2 overflow-x-auto p-0"
          >
            {holdings.map(({ asset, units }) => (
              <li
                key={asset.id}
                className="flex min-w-28 flex-1 shrink-0 snap-start flex-col items-center rounded-2xl px-3 py-2 text-center"
              >
                <span className="text-[18px] leading-6 font-bold text-navy-700">{asset.ticker}</span>
                <span className="mt-1 text-[20px] leading-7 font-semibold text-navy-900 tabular-nums">
                  {formatDecimal(units, 2)}
                </span>
                <span className="text-[12px] leading-4 text-text-muted">{asset.type === 'fund' ? 'units' : 'shares'}</span>
              </li>
            ))}
          </ul>
          <button type="button" aria-label="Scroll holdings right" disabled={edges.end} onClick={() => scrollByPage(1)} className={ARROW}>
            <ChevronsRight size={22} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  )
}

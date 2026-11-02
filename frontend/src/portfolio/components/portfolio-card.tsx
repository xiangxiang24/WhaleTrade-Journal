import { useState } from 'react'
import { CalendarDays, ChevronRight, CircleCheck } from 'lucide-react'
import type { Portfolio } from '../../shared/types/portfolio'
import { formatUpdated, goalProgress } from '../types/format'
import CardMenu from './card-menu'
import Money from './money'
import PortfolioIcon from './portfolio-icon'

type PortfolioCardProps = {
  portfolio: Portfolio
  timeZone: string
  onOpen: (id: number) => void
  onEdit: (portfolio: Portfolio) => void
  onTrash: (portfolio: Portfolio) => void
}

const OVERLINE = 'text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase'

// ส่วน Annual Goal + แถบความคืบหน้า (ถึงเป้า = แถบเขียว + ป้าย "100% full", ยังไม่ตั้ง Goal = ข้อความชวนตั้ง)
function GoalBox({ portfolio }: { portfolio: Portfolio }) {
  const progress = goalProgress(portfolio.reached, portfolio.annualGoal)
  const full = progress === 100

  return (
    <div className="rounded-3xl bg-blue-50 px-4 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className={OVERLINE}>Annual goal</span>
        {portfolio.annualGoal ? (
          <Money value={portfolio.annualGoal} className="text-[22px] leading-7 font-semibold text-navy-900" />
        ) : (
          <span className="text-[15px] leading-6 font-semibold text-navy-700">No goal yet</span>
        )}
      </div>

      {progress === null ? (
        <p className="m-0 mt-3 text-[13px] leading-5 text-text-muted">
          Set an annual goal from Edit details to watch your progress grow.
        </p>
      ) : (
        <>
          <div
            role="progressbar"
            aria-label={`${portfolio.name} goal progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="mt-3 h-2 overflow-hidden rounded-pill bg-blue-100"
          >
            <div
              className={`h-full rounded-pill ${full ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[13px] leading-5">
            <span className="tabular-nums text-navy-900">{`${portfolio.reached.toLocaleString('en-US')} reached`}</span>
            {full ? (
              <span className="inline-flex items-center gap-1 rounded-pill bg-green-50 px-2.5 py-0.5 text-[12px] leading-4 font-semibold text-navy-900">
                <CircleCheck size={14} strokeWidth={1.75} aria-hidden="true" className="text-green-500" />
                100% full
              </span>
            ) : (
              <span className="font-semibold text-navy-700 tabular-nums">{progress}%</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// การ์ดพอร์ต: หัว (ไอคอน ชื่อ คำอธิบาย เมนู) / เป้าหมาย / สถิติ / ท้าย (อัปเดตล่าสุด + Open)
export default function PortfolioCard({ portfolio, timeZone, onOpen, onEdit, onTrash }: PortfolioCardProps) {
  // ยก z-index ของการ์ดที่เมนูเปิดอยู่ เพื่อไม่ให้การ์ดข้างเคียงทับเมนู
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <article
      aria-label={portfolio.name}
      className={`relative flex h-full flex-col rounded-4xl bg-surface p-5 shadow-md transition-[box-shadow,translate] duration-300 ease-soft hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 min-[640px]:p-6 ${
        menuOpen ? 'z-10' : ''
      }`}
    >
      <header className="flex items-center gap-3 border-b border-line pb-4">
        <PortfolioIcon icon={portfolio.icon} className="size-11 min-[640px]:size-12" />
        <div className="min-w-0 flex-1">
          <h2 className="m-0 line-clamp-2 text-[18px] leading-6 font-bold break-words text-navy-900">{portfolio.name}</h2>
          {portfolio.tagline && (
            <p className="m-0 truncate text-[13px] leading-5 text-text-muted">{portfolio.tagline}</p>
          )}
        </div>
        <CardMenu
          portfolioName={portfolio.name}
          onOpenChange={setMenuOpen}
          onEdit={() => onEdit(portfolio)}
          onTrash={() => onTrash(portfolio)}
        />
      </header>

      <div className="mt-4">
        <GoalBox portfolio={portfolio} />
      </div>

      <dl className="m-0 mt-5 flex flex-wrap gap-x-6 gap-y-3 px-1">
        <div className="min-w-0 flex-auto">
          <dt className={OVERLINE}>Total recorded DCA</dt>
          <dd className="m-0 mt-1">
            <Money value={portfolio.totalDca} className="text-[18px] leading-7 font-semibold text-navy-900" />
          </dd>
        </div>
        <div className="min-w-0 flex-auto">
          <dt className={OVERLINE}>Transactions</dt>
          <dd className="m-0 mt-1 text-[18px] leading-7 font-semibold whitespace-nowrap text-navy-900 tabular-nums">
            {portfolio.entries} <span className="text-[0.7em] font-semibold text-text-muted">{portfolio.entries === 1 ? 'entry' : 'entries'}</span>
          </dd>
        </div>
      </dl>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-3 pt-6">
        <p className="m-0 flex items-center gap-1.5 text-[12px] leading-4 text-text-muted">
          <CalendarDays size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <span>
            Last updated <time dateTime={portfolio.updatedAt}>{formatUpdated(portfolio.updatedAt, timeZone)}</time>
          </span>
        </p>
        <button
          type="button"
          onClick={() => onOpen(portfolio.id)}
          aria-label={`Open ${portfolio.name}`}
          className="inline-flex h-10 items-center gap-1 rounded-pill bg-blue-500 pr-3 pl-5 text-[15px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900"
        >
          Open
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </footer>
    </article>
  )
}

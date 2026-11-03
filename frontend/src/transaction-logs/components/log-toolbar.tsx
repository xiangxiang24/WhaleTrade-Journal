import { ChevronDown, Search } from 'lucide-react'
import { formatMonthHeading } from '../types/format'
import { useI18n } from '../../shared/i18n/use-i18n'

export type SectorTab = { value: string; label: string; count: number }

type LogToolbarProps = {
  holdingCount: number
  query: string
  onQueryChange: (value: string) => void
  tabs: SectorTab[]
  sector: string
  onSectorChange: (value: string) => void
  /** เดือน (YYYY-MM) ที่มี transaction */
  months: string[]
  month: string
  onMonthChange: (value: string) => void
}

// แถบหัวตาราง: ชื่อ + ป้าย N shares / ค้นหา / แท็บ sector (All (n) + sector ของหุ้นในพอร์ต) / เลือกเดือน
export default function LogToolbar({
  holdingCount,
  query,
  onQueryChange,
  tabs,
  sector,
  onSectorChange,
  months,
  month,
  onMonthChange,
}: LogToolbarProps) {
  const { t, locale } = useI18n()
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="flex items-center gap-3">
        <h2 className="m-0 text-[24px] leading-8 font-bold text-navy-900 min-[640px]:text-[28px] min-[640px]:leading-9">
          {t('Transaction Logs')}
        </h2>
        <span className="rounded-pill bg-blue-100 px-3 py-0.5 text-[12px] leading-5 font-semibold text-navy-700">
          {t(holdingCount === 1 ? '{n} share' : '{n} shares', { n: holdingCount })}
        </span>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-3 max-[639px]:w-full">
        <label className="relative block min-w-0 flex-1 basis-56 min-[1280px]:w-72 min-[1280px]:flex-none">
          <span className="sr-only">{t('Search stock or fund')}</span>
          <Search
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-blue-500"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t('Search stock or fund')}
            className="h-11 w-full rounded-pill border-2 border-blue-500 bg-surface pr-4 pl-11 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus"
          />
        </label>

        <label className="relative block">
          <span className="sr-only">{t('Filter by month')}</span>
          {/* appearance-none: ปิดหน้าตา select ของระบบ (macOS วาดเป็นสี่เหลี่ยม) เพื่อให้เป็นทรงแคปซูลเหมือนช่องค้นหา */}
          <select
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
            className="h-11 appearance-none rounded-pill border-2 border-blue-500 bg-surface pr-10 pl-4 text-[14px] font-medium text-navy-700 outline-none transition-shadow duration-150 focus:shadow-focus"
          >
            <option value="all">{t('All months')}</option>
            {months.map((value) => (
              <option key={value} value={value}>
                {formatMonthHeading(value, locale)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-blue-500"
          />
        </label>
      </div>

      <div
        role="tablist"
        aria-label={t('Filter by sector')}
        className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-pill bg-blue-50 p-1 max-[639px]:w-full"
      >
        {tabs.map((tab) => {
          const selected = tab.value === sector
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onSectorChange(tab.value)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-pill px-4 text-[13px] leading-5 font-semibold whitespace-nowrap transition-colors duration-150 ${
                selected ? 'bg-blue-500 text-surface' : 'text-navy-700 hover:bg-blue-100'
              }`}
            >
              {tab.label}
              <span className={selected ? 'text-surface/80' : 'text-text-muted'}>({tab.count})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

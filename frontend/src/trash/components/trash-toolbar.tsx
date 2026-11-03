import { Search, Trash2 } from 'lucide-react'
import { useI18n } from '../../shared/i18n/use-i18n'
import type { TrashTab } from '../types/trash'

type TrashToolbarProps = {
  tab: TrashTab
  onTabChange: (tab: TrashTab) => void
  journalCount: number
  portfolioCount: number
  query: string
  onQueryChange: (value: string) => void
  /** ซ่อนปุ่มล้างถังขยะเมื่อแท็บที่เปิดอยู่ว่าง */
  canEmpty: boolean
  onEmpty: () => void
}

// แถบเครื่องมือ: แท็บ Journals / Portfolios + ช่องค้นหา (ใช้กับแท็บที่เปิดอยู่) + ปุ่มล้างถังขยะของแท็บนั้น
export default function TrashToolbar({
  tab,
  onTabChange,
  journalCount,
  portfolioCount,
  query,
  onQueryChange,
  canEmpty,
  onEmpty,
}: TrashToolbarProps) {
  const { t } = useI18n()
  const tabs: { value: TrashTab; label: string; count: number }[] = [
    { value: 'journals', label: t('Journals'), count: journalCount },
    { value: 'portfolios', label: t('Portfolios'), count: portfolioCount },
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div
        role="tablist"
        aria-label={t('Trash sections')}
        className="flex gap-1 rounded-pill bg-blue-50 p-1 max-[639px]:w-full"
      >
        {tabs.map((item) => {
          const selected = item.value === tab
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onTabChange(item.value)}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-pill px-5 text-[14px] leading-5 font-semibold whitespace-nowrap transition-colors duration-150 max-[639px]:flex-1 ${
                selected ? 'bg-blue-500 text-surface' : 'text-navy-700 hover:bg-blue-100'
              }`}
            >
              {item.label}
              <span className={selected ? 'text-surface/80' : 'text-text-muted'}>({item.count})</span>
            </button>
          )
        })}
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-3 max-[639px]:w-full">
        <label className="relative block min-w-0 max-[639px]:w-full min-[640px]:w-64 min-[1280px]:w-72">
          <span className="sr-only">{tab === 'journals' ? t('Search deleted journals') : t('Search deleted portfolios')}</span>
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
            placeholder={tab === 'journals' ? t('Search by title') : t('Search by name')}
            className="h-11 w-full rounded-pill border border-blue-500 bg-surface pr-4 pl-11 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-blue-500/70 focus:shadow-focus"
          />
        </label>
        {canEmpty && (
          <button
            type="button"
            onClick={onEmpty}
            className="inline-flex h-11 items-center gap-2 rounded-pill border-2 border-red-500 bg-surface px-5 text-[14px] leading-5 font-semibold text-red-500 transition-colors duration-150 hover:bg-red-50 active:bg-red-50 max-[639px]:w-full max-[639px]:justify-center"
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
            {t('Empty trash')}
          </button>
        )}
      </div>
    </div>
  )
}

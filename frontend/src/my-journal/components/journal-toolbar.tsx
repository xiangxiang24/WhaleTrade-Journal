import { PenLine, Search, Sprout } from 'lucide-react'
import { useI18n } from '../../shared/i18n/use-i18n'

type JournalToolbarProps = {
  query: string
  onQueryChange: (value: string) => void
  /** ผลตอบแทนปันผลเฉลี่ยที่แสดงในป้าย เช่น "6.84%" (ไม่ส่งมา = ไม่แสดงป้าย) */
  dividendYield?: string
  onNewNote: () => void
}

// แถวบน: ช่องค้นหา (ซ้าย) / ป้าย Dividend Yield + ปุ่ม New Note (ขวา)
export default function JournalToolbar({
  query,
  onQueryChange,
  dividendYield,
  onNewNote,
}: JournalToolbarProps) {
  const { t } = useI18n()
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <label className="relative block w-full min-[1280px]:w-70">
        <span className="sr-only">{t('Search Journal Book')}</span>
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
          placeholder={t('Search Journal Book')}
          className="h-11 w-full rounded-pill border border-blue-500 bg-surface pr-4 pl-11 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-blue-500/70 focus:shadow-focus"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 min-[640px]:gap-4 max-[639px]:w-full">
        {dividendYield && (
          <span className="inline-flex h-11 items-center gap-2 rounded-pill bg-blue-50 px-4 max-[639px]:w-full max-[639px]:justify-center text-[14px] leading-5 font-medium text-navy-900">
            <Sprout size={16} strokeWidth={1.75} aria-hidden="true" className="text-navy-700" />
            {t('Dividend Yield at Cost: {value}', { value: dividendYield })}
          </span>
        )}
        <button
          type="button"
          onClick={onNewNote}
          className="inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[18px] max-[639px]:w-full max-[639px]:justify-center leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900"
        >
          <PenLine size={20} strokeWidth={1.75} aria-hidden="true" />
          {t('New Note')}
        </button>
      </div>
    </div>
  )
}

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDayLong, formatMonthTitle, monthGrid } from '../types/datetime'
import { useI18n } from '../../shared/i18n/use-i18n'

export type DayMarks = { total: number; pending: number }

type MonthCalendarProps = {
  year: number
  /** 0-11 */
  month: number
  /** วันที่เลือกอยู่ (YYYY-MM-DD) */
  selectedKey: string
  todayKey: string
  /** จำนวนการเตือนของแต่ละวัน key = YYYY-MM-DD */
  marks: Map<string, DayMarks>
  onSelect: (key: string) => void
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const NAV =
  'inline-flex size-9 items-center justify-center rounded-pill text-navy-700 hover:bg-blue-50 active:bg-blue-100'

// ปฏิทินรายเดือน (design rules 7.7): เริ่มวันจันทร์ ช่อง 40 × 40 วันนี้ = วงกลมฟ้า วันที่เลือก = ขอบ 2px
// มีการเตือนค้าง = จุดฟ้า, มีแต่รายการที่เสร็จแล้ว = จุดฟ้าอ่อน, วันนอกเดือนจาง
export default function MonthCalendar({
  year,
  month,
  selectedKey,
  todayKey,
  marks,
  onSelect,
  onPrev,
  onNext,
  onToday,
}: MonthCalendarProps) {
  const { t, locale } = useI18n()
  const cells = monthGrid(year, month)
  const showToday = todayKey.slice(0, 7) !== `${year}-${String(month + 1).padStart(2, '0')}`

  return (
    <section aria-label={t('Calendar')} className="rounded-4xl bg-surface p-5 shadow-md min-[640px]:p-6">
      <header className="flex items-center justify-between gap-2">
        <h2 aria-live="polite" className="m-0 text-[20px] leading-7 font-bold text-navy-900">
          {formatMonthTitle(year, month, locale)}
        </h2>
        <div className="flex items-center gap-1">
          {showToday && (
            <button
              type="button"
              onClick={onToday}
              className="mr-1 inline-flex h-8 items-center rounded-pill px-3 text-[13px] leading-5 font-semibold text-navy-700 hover:bg-blue-50 active:bg-blue-100"
            >
              {t('Today')}
            </button>
          )}
          <button type="button" aria-label={t('Previous month')} onClick={onPrev} className={NAV}>
            <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button type="button" aria-label={t('Next month')} onClick={onNext} className={NAV}>
            <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div role="grid" aria-label={formatMonthTitle(year, month, locale)} className="mt-3">
        <div role="row" className="grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              role="columnheader"
              className="py-1 text-center text-[12px] leading-4 font-medium text-text-muted"
            >
              {t(day)}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map(({ key, inMonth }) => {
            const mark = marks.get(key)
            const isToday = key === todayKey
            const selected = key === selectedKey
            const label = `${formatDayLong(key, locale)}${
              mark ? `, ${t(mark.total === 1 ? '{n} reminder' : '{n} reminders', { n: mark.total })}` : ''
            }${isToday ? `, ${t('today')}` : ''}`
            return (
              <div key={key} role="gridcell" className="flex justify-center">
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={selected}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={() => onSelect(key)}
                  data-no-bounce
                  className={`relative inline-flex size-10 items-center justify-center text-[13px] leading-5 tabular-nums transition-colors duration-150 ${
                    isToday ? 'rounded-pill bg-blue-500 font-semibold text-surface' : 'rounded-sm hover:bg-blue-50'
                  } ${selected ? 'border-2 border-blue-500' : 'border-2 border-transparent'} ${
                    isToday ? '' : inMonth ? 'text-navy-900' : 'text-text-muted opacity-50'
                  }`}
                >
                  {Number(key.slice(8))}
                  {mark && (
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-1 size-1 rounded-pill ${
                        isToday ? 'bg-surface' : mark.pending > 0 ? 'bg-blue-500' : 'bg-blue-200'
                      }`}
                    />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <ul className="m-0 mt-3 flex list-none flex-wrap items-center gap-x-5 gap-y-1 p-0 text-[12px] leading-4 text-text-muted">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-pill bg-blue-500" />
          {t('Upcoming')}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-1.5 rounded-pill bg-blue-200" />
          {t('Done')}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-3 rounded-pill bg-blue-500" />
          {t('Today')}
        </li>
      </ul>
    </section>
  )
}

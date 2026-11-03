import { CalendarDays, Plus } from 'lucide-react'
import type { Reminder } from '../../shared/types/reminder'
import { formatDay } from '../types/datetime'
import ReminderCard from './reminder-card'
import { useI18n } from '../../shared/i18n/use-i18n'

type DayRemindersProps = {
  /** การเตือนของวันที่เลือก (ถ้าเลือกวันนี้ รวมรายการค้างที่เลยเวลามาแล้ว) เรียงตามเวลา */
  reminders: Reminder[]
  selectedKey: string
  todayKey: string
  /** ไม่มีการเตือนเลยในระบบ */
  noneAtAll: boolean
  now: Date
  timeZone: string
  onToggle: (reminder: Reminder) => void
  onEdit: (reminder: Reminder) => void
  onNew: () => void
}

// ข้อความตกแต่งคงที่ของหน้าจอ (database.md หัวข้อ 4)
const CONTEXT = 'Autumn Compounding 2026'

// ส่วน Scheduled In Day: การเตือนของวันที่เลือกในปฏิทิน + สถานะว่าง
export default function DayReminders({
  reminders,
  selectedKey,
  todayKey,
  noneAtAll,
  now,
  timeZone,
  onToggle,
  onEdit,
  onNew,
}: DayRemindersProps) {
  const { t, locale } = useI18n()
  const isToday = selectedKey === todayKey

  return (
    <section aria-label={t('Scheduled in day')}>
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 className="m-0 flex items-center gap-2 text-[20px] leading-7 font-bold text-navy-900">
          <CalendarDays size={20} strokeWidth={1.75} aria-hidden="true" className="text-blue-500" />
          {t('Scheduled In Day')}
          <span className="text-[14px] leading-5 font-medium text-text-muted">
            {isToday ? t('Today') : formatDay(selectedKey, true, locale)}
          </span>
        </h2>
        <p className="m-0 text-[12px] leading-5 text-text-muted">{t(CONTEXT)}</p>
      </header>

      {reminders.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-3xl bg-surface px-6 py-10 text-center shadow-md">
          <p className="m-0 text-[17px] leading-6 font-bold text-navy-900">
            {noneAtAll ? t('A calm, empty calendar') : t('Nothing scheduled for this day')}
          </p>
          <p className="m-0 mt-1 max-w-100 text-[14px] leading-6 text-text-muted">
            {noneAtAll
              ? t('Set a gentle reminder for a dividend date or a quiet check-in with your plan.')
              : t('Enjoy the quiet. You can add a gentle reminder for this day anytime.')}
          </p>
          <button
            type="button"
            onClick={onNew}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[15px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900"
          >
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            {t('New Reminder')}
          </button>
        </div>
      ) : (
        <ul className="m-0 mt-4 flex list-none flex-col gap-4 p-0">
          {reminders.map((reminder) => (
            <li key={reminder.id}>
              <ReminderCard
                reminder={reminder}
                now={now}
                todayKey={todayKey}
                timeZone={timeZone}
                onToggle={onToggle}
                onEdit={onEdit}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

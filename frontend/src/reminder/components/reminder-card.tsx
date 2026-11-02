import { Check, CheckCheck, Clock, SquarePen } from 'lucide-react'
import type { Reminder } from '../../shared/types/reminder'
import { dayKey, formatDay, formatRemindAt } from '../types/datetime'

type ReminderCardProps = {
  reminder: Reminder
  now: Date
  todayKey: string
  timeZone: string
  onToggle: (reminder: Reminder) => void
  onEdit: (reminder: Reminder) => void
}

// วงกลมเช็กสถานะ: ว่าง = ยังไม่เสร็จ, เขียว + เครื่องหมายถูก = เสร็จแล้ว (ไม่สื่อด้วยสีอย่างเดียว)
function CheckCircle({ done, label, onClick }: { done: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex size-7 shrink-0 items-center justify-center rounded-pill border-2 transition-colors duration-150 ${
        done ? 'border-green-500 bg-green-500 text-surface' : 'border-blue-200 bg-surface text-transparent hover:border-blue-500 hover:text-blue-500'
      }`}
    >
      <Check size={16} strokeWidth={2.25} aria-hidden="true" />
    </button>
  )
}

// การ์ดการเตือน: ยังไม่เสร็จ = เวลา + ชื่อ + รายละเอียด + ปุ่ม Edit, เสร็จแล้ว = แถบจาง "Done 20 Sep • ..." (กดวงกลมเพื่อยกเลิก)
export default function ReminderCard({ reminder, now, todayKey, timeZone, onToggle, onEdit }: ReminderCardProps) {
  if (reminder.done) {
    return (
      <div className="flex items-start gap-3 rounded-3xl bg-blue-50 px-4 py-4 min-[640px]:px-5">
        <CheckCircle done label={`Mark “${reminder.title}” as not done`} onClick={() => onToggle(reminder)} />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[14px] leading-5 font-semibold text-text-muted line-through">{reminder.title}</p>
          <p className="m-0 text-[12px] leading-5 text-text-muted">
            Done {formatDay(dayKey(reminder.doneAt ?? reminder.remindAt, timeZone), false)}
            {reminder.description && (
              <span className="ml-1">
                • <em>{reminder.description}</em>
              </span>
            )}
          </p>
        </div>
        <CheckCheck size={18} strokeWidth={1.75} aria-hidden="true" className="mt-1 shrink-0 text-text-muted" />
      </div>
    )
  }

  const due = reminder.remindAt <= now.toISOString()
  return (
    <article className="rounded-3xl bg-surface p-4 shadow-md min-[640px]:p-5">
      <div className="flex items-start gap-3">
        <CheckCircle done={false} label={`Mark “${reminder.title}” as done`} onClick={() => onToggle(reminder)} />
        <div className="min-w-0 flex-1">
          <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] leading-5 text-navy-700">
            <Clock size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
            <time dateTime={reminder.remindAt}>{formatRemindAt(reminder.remindAt, todayKey, timeZone)}</time>
            {due && (
              <span className="inline-flex h-5 items-center rounded-pill bg-red-50 px-2 text-[11px] leading-4 font-semibold text-navy-900">
                Due
              </span>
            )}
          </p>
          <h3 className="m-0 mt-0.5 text-[17px] leading-6 font-bold break-words text-navy-900">{reminder.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => onEdit(reminder)}
          aria-label={`Edit ${reminder.title}`}
          className="group/icon inline-flex h-8 shrink-0 items-center gap-1.5 rounded-pill px-2 text-[13px] leading-5 font-semibold text-navy-700 hover:text-blue-500"
        >
          <SquarePen
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="transition-[stroke-width] duration-150 group-hover/icon:stroke-[2.5]"
          />
          Edit
        </button>
      </div>
      {reminder.description && (
        <p className="m-0 mt-3 rounded-2xl bg-blue-50 px-4 py-3 text-[13px] leading-5 break-words text-navy-700 min-[640px]:ml-10">
          {reminder.description}
        </p>
      )}
    </article>
  )
}

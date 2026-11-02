import { Plus, Sparkles } from 'lucide-react'

type ReminderHeaderProps = {
  /** จำนวนการเตือนที่ยังไม่เสร็จและอยู่ในสัปดาห์นี้ (null = กำลังโหลด) */
  dueThisWeek: number | null
  onNew: () => void
}

// ข้อความตกแต่งคงที่ของหน้าจอ (ยังไม่ผ่านระบบแปลภาษา)
const TITLE = 'Reminders & Calm Tasks'
const SUBTITLE = 'Take your time. No rush in long-term investing.'

// ส่วนหัว: ชื่อหน้า + ป้าย "N due this week" / คำโปรย / ปุ่ม New Reminder
export default function ReminderHeader({ dueThisWeek, onNew }: ReminderHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0 flex-1 basis-80">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h1 className="m-0 flex items-center gap-2 text-[30px] leading-10 font-bold text-navy-900 min-[640px]:text-[36px] min-[640px]:leading-11 min-[1280px]:text-[40px] min-[1280px]:leading-12">
            {TITLE}
            <Sparkles size={28} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-navy-700" />
          </h1>
          {dueThisWeek !== null && (
            <span className="inline-flex h-9 items-center rounded-pill bg-blue-100 px-4 text-[15px] leading-6 font-semibold text-navy-700 min-[640px]:text-[17px]">
              {dueThisWeek} due this week
            </span>
          )}
        </div>
        <p className="m-0 mt-1 text-[15px] leading-6 text-navy-700 min-[640px]:text-[17px] min-[640px]:leading-7 min-[1280px]:text-[18px]">
          {SUBTITLE}
        </p>
      </div>

      <button
        type="button"
        onClick={onNew}
        className="inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 max-[639px]:w-full max-[639px]:justify-center"
      >
        <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
        New Reminder
      </button>
    </div>
  )
}

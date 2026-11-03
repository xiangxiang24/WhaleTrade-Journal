import { useCallback, useMemo, useState } from 'react'
import banner from '../assets/Banner.png'
import AppLayout from '../shared/app-shell/app-layout'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import type { Reminder, ReminderFormValues, Task } from '../shared/types/reminder'
import type { SidebarKey, SidebarUser } from '../shared/types/sidebar'
import PortfolioToastView from '../portfolio/components/portfolio-toast'
import CalmBanner from './components/calm-banner'
import DayReminders from './components/day-reminders'
import MonthCalendar, { type DayMarks } from './components/month-calendar'
import ReminderHeader from './components/reminder-header'
import TodoCard from './components/todo-card'
import DeleteReminderModal from './modals/delete-reminder-modal'
import ReminderFormModal from './modals/reminder-form-modal'
import { addDays, dayKey, startOfWeek, zonedToUtc } from './types/datetime'
import type { ReminderToast } from './types/reminder'
import { useNow } from './types/use-now'
import { useReminders } from './types/use-reminders'
import { useI18n } from '../shared/i18n/use-i18n'

type ReminderPageProps = {
  user: SidebarUser
  /** จำนวนที่ถึงเวลาแล้วระหว่างโหลดข้อมูล (หลังโหลดแล้วหน้านี้คำนวณเอง) */
  reminderBadge?: number
  /** เขตเวลาของผู้ใช้ (รหัส IANA จาก User.timezone) */
  timeZone?: string
  onNavigate?: (key: SidebarKey) => void
  onLogout?: () => void
}

const PRIMARY_BUTTON =
  'inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900'

// หน้า Reminder: หัว + แบนเนอร์ + ปฏิทินรายเดือน + การเตือนของวันที่เลือก (ซ้าย) / Gentle To-Dos (ขวา)
export default function ReminderPage({
  user,
  reminderBadge,
  timeZone = 'Asia/Bangkok',
  onNavigate,
  onLogout,
}: ReminderPageProps) {
  const { t } = useI18n()
  const { reminders, tasks, status, reload, addReminder, editReminder, removeReminder, toggleReminder, addTask, toggleTask } =
    useReminders()
  const now = useNow()
  const todayKey = dayKey(now, timeZone)
  const { leaving, leaveTo } = usePageLeave()

  const [selectedKey, setSelectedKey] = useState(() => dayKey(new Date(), timeZone))
  const [view, setView] = useState(() => {
    const key = dayKey(new Date(), timeZone)
    return { year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) - 1 }
  })
  // form = null ปิด, { reminder: null } = ตั้งใหม่, { reminder } = แก้ของเดิม
  const [form, setForm] = useState<{ reminder: Reminder | null } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Reminder | null>(null)
  const [toast, setToast] = useState<ReminderToast | null>(null)

  const showToast = useCallback((message: string) => setToast({ id: Date.now(), message }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  const stamp = now.toISOString()
  const dueNow = reminders.filter((reminder) => !reminder.done && reminder.remindAt <= stamp).length
  // ตัวเลข badge ที่ Sidebar: ระหว่างโหลดใช้ค่าจากผู้เรียก, หลังโหลดคำนวณเองให้เปลี่ยนทันทีที่ติ๊ก/ลบ/ถึงเวลา
  const badge = status === 'ready' ? dueNow : reminderBadge

  // "N due this week" = ยังไม่เสร็จและอยู่ในสัปดาห์นี้ (จันทร์ → อาทิตย์)
  const dueThisWeek = useMemo(() => {
    const from = startOfWeek(todayKey)
    const to = addDays(from, 6)
    return reminders.filter((reminder) => {
      const key = dayKey(reminder.remindAt, timeZone)
      return !reminder.done && key >= from && key <= to
    }).length
  }, [reminders, todayKey, timeZone])

  // จุดในปฏิทิน: จำนวนการเตือนของแต่ละวัน
  const marks = useMemo(() => {
    const map = new Map<string, DayMarks>()
    for (const reminder of reminders) {
      const key = dayKey(reminder.remindAt, timeZone)
      const mark = map.get(key) ?? { total: 0, pending: 0 }
      mark.total += 1
      if (!reminder.done) mark.pending += 1
      map.set(key, mark)
    }
    return map
  }, [reminders, timeZone])

  // การเตือนของวันที่เลือก: ค้างก่อนแล้วเรียงตามเวลา, เสร็จแล้วอยู่ท้าย; เลือกวันนี้ = รวมรายการค้างที่เลยเวลามาจากวันก่อนด้วย
  const dayList = useMemo(() => {
    return reminders
      .filter((reminder) => {
        const key = dayKey(reminder.remindAt, timeZone)
        return key === selectedKey || (selectedKey === todayKey && !reminder.done && key < todayKey)
      })
      .sort((a, b) => Number(a.done) - Number(b.done) || a.remindAt.localeCompare(b.remindAt))
  }, [reminders, selectedKey, todayKey, timeZone])

  function selectDay(key: string) {
    setSelectedKey(key)
    setView({ year: Number(key.slice(0, 4)), month: Number(key.slice(5, 7)) - 1 })
  }

  function moveMonth(step: number) {
    setView((current) => {
      const date = new Date(Date.UTC(current.year, current.month + step, 1))
      return { year: date.getUTCFullYear(), month: date.getUTCMonth() }
    })
  }

  async function handleSubmit(values: ReminderFormValues) {
    const payload = {
      title: values.title,
      description: values.description || null,
      remindAt: zonedToUtc(values.date, values.time, timeZone),
    }
    const editing = form?.reminder
    if (editing) await editReminder(editing.id, payload)
    else await addReminder(payload)
    selectDay(values.date)
    showToast(editing ? t('Reminder updated') : t('Reminder set'))
  }

  async function handleToggle(reminder: Reminder) {
    try {
      await toggleReminder(reminder.id, !reminder.done)
    } catch {
      showToast(t('Could not update this reminder. Please try again.'))
    }
  }

  async function handleToggleTask(task: Task) {
    try {
      await toggleTask(task.id, !task.done)
    } catch {
      showToast(t('Could not update this task. Please try again.'))
    }
  }

  async function handleDelete(reminder: Reminder) {
    await removeReminder(reminder.id)
    showToast(t('Reminder deleted'))
  }

  const openNew = () => setForm({ reminder: null })

  return (
    <AppLayout
      active="reminder"
      user={user}
      reminderBadge={badge}
      onNavigate={(key) => {
        if (key !== 'reminder') leaveTo(() => onNavigate?.(key))
      }}
      onLogout={() => onLogout?.()}
    >
      <>
        <div className={`pt-2 pb-6 ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
          <div className="animate-fade-up motion-reduce:animate-none">
            <ReminderHeader dueThisWeek={status === 'ready' ? dueThisWeek : null} onNew={openNew} />
          </div>

          {status === 'loading' && (
            <div role="status" aria-label={t('Loading your reminders')} className="mt-6 flex flex-col gap-4">
              <div className="h-20 animate-pulse rounded-3xl bg-blue-100 motion-reduce:animate-none" />
              <div className="grid gap-6 min-[1280px]:grid-cols-[7fr_5fr]">
                <div className="h-96 animate-pulse rounded-4xl bg-blue-100 motion-reduce:animate-none" />
                <div className="h-96 animate-pulse rounded-4xl bg-blue-100 motion-reduce:animate-none" />
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6 flex flex-col items-center rounded-4xl bg-surface px-6 py-12 text-center shadow-md">
              <img className="h-36 w-auto min-[640px]:h-44" src={banner} alt="" />
              <p className="m-0 mt-4 text-[18px] leading-7 font-bold text-navy-900">{t('Could not load your reminders')}</p>
              <p className="m-0 mt-1 text-[14px] leading-6 text-text-muted">{t('Something went wrong. Please try again.')}</p>
              <button type="button" onClick={reload} className={`${PRIMARY_BUTTON} mt-6`}>
                {t('Try again')}
              </button>
            </div>
          )}

          {status === 'ready' && (
            <>
              <div className="mt-5 animate-fade-up px-1 [animation-delay:80ms] motion-reduce:animate-none">
                <CalmBanner />
              </div>

              {/* กว้างน้อยกว่า 1280: To-Dos ลงไปอยู่ล่างเต็มความกว้าง (design rules 5.2) */}
              <div className="mt-6 grid animate-fade-up grid-cols-1 gap-6 px-1 [animation-delay:160ms] min-[1280px]:grid-cols-[minmax(0,7fr)_minmax(300px,5fr)] min-[1280px]:items-start motion-reduce:animate-none">
                <div className="flex min-w-0 flex-col gap-6">
                  <MonthCalendar
                    year={view.year}
                    month={view.month}
                    selectedKey={selectedKey}
                    todayKey={todayKey}
                    marks={marks}
                    onSelect={selectDay}
                    onPrev={() => moveMonth(-1)}
                    onNext={() => moveMonth(1)}
                    onToday={() => selectDay(todayKey)}
                  />
                  <DayReminders
                    reminders={dayList}
                    selectedKey={selectedKey}
                    todayKey={todayKey}
                    noneAtAll={reminders.length === 0}
                    now={now}
                    timeZone={timeZone}
                    onToggle={handleToggle}
                    onEdit={(reminder) => setForm({ reminder })}
                    onNew={openNew}
                  />
                </div>
                <div className="min-w-0 pt-2">
                  <TodoCard tasks={tasks} onToggle={handleToggleTask} onAdd={addTask} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* modal และ toast อยู่นอก wrapper ที่มี transform เพื่อให้ position: fixed อ้างอิงทั้งหน้าต่าง */}
        <ReminderFormModal
          open={form !== null}
          reminder={form?.reminder}
          defaultDate={selectedKey}
          timeZone={timeZone}
          onSubmit={handleSubmit}
          onDelete={(reminder) => {
            setForm(null)
            setDeleteTarget(reminder)
          }}
          onClose={() => setForm(null)}
        />
        <DeleteReminderModal reminder={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
        <PortfolioToastView toast={toast} onUndo={() => undefined} onDismiss={dismissToast} />
      </>
    </AppLayout>
  )
}

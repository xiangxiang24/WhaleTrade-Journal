import type { Reminder, Task } from '../types/reminder'

// ที่เก็บข้อมูลจำลองของการเตือนและ task (ในหน่วยความจำ ใช้ร่วมกันทุกหน้า) ไฟล์เดียวที่ต้องแก้ตอนต่อ backend
// ข้อมูลตั้งต้นสร้างจาก "ตอนนี้" ย้อนหลัง/ล่วงหน้า เพื่อให้มีรายการที่ถึงเวลาแล้ว (badge) เสมอไม่ว่าเปิดวันไหน
const NOW = Date.now()
const HOUR = 3_600_000
const DAY = 24 * HOUR

// ปัดเป็นทุก 5 นาที ให้เวลาในการ์ดดูเรียบร้อย
const at = (offsetMs: number) => new Date(Math.round((NOW + offsetMs) / 300_000) * 300_000).toISOString()

let reminders: Reminder[] = [
  {
    id: 1,
    title: 'SCB Ex-Dividend Date (XD)',
    description:
      'Ensure cash account is set for auto-deposit dividend reinvestment. Dividend yield locked at 6.1% annual run-rate.',
    remindAt: at(-10 * 60_000),
    done: false,
    doneAt: null,
  },
  {
    id: 2,
    title: 'Review the dividend calendar for next quarter',
    description: 'Check which holdings pay in the coming months and note anything unusual.',
    remindAt: at(-20 * HOUR),
    done: false,
    doneAt: null,
  },
  {
    id: 3,
    title: 'TISCO payment date',
    description: 'Dividend lands in the bank account. Record it in the portfolio log.',
    remindAt: at(3 * DAY),
    done: false,
    doneAt: null,
  },
  {
    id: 4,
    title: 'Half-year check-in',
    description: 'Six months in. Are the reasons I bought still true?',
    remindAt: at(9 * DAY),
    done: false,
    doneAt: null,
  },
  {
    id: 5,
    title: 'Rebalance monthly DCA allocation',
    description: 'Order settled mindfully without market chasing',
    remindAt: at(-5 * DAY),
    done: true,
    doneAt: at(-5 * DAY + 3 * HOUR),
  },
]

let tasks: Task[] = [
  { id: 1, text: 'Update portfolio notes after dividend payout', done: false, createdAt: at(-4 * DAY) },
  { id: 2, text: 'Review sell rules\n“Never sell solely due to price drops”', done: false, createdAt: at(-3 * DAY) },
  { id: 3, text: 'Check bank account auto-debit for DCA', done: false, createdAt: at(-2 * DAY) },
  { id: 4, text: 'Read annual shareholder letter', done: true, createdAt: at(-6 * DAY) },
]

let nextReminderId = 6
let nextTaskId = 5

const LATENCY_MS = 300
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

/** จำนวนการเตือนที่ถึงเวลาแล้วและยังไม่เสร็จ = ตัวเลข badge ที่เมนู Reminder ใน Sidebar (อ่านจากที่เก็บตรงๆ ใช้ได้ทุกหน้า) */
export function countDueReminders(now = new Date()) {
  const stamp = now.toISOString()
  return reminders.filter((reminder) => !reminder.done && reminder.remindAt <= stamp).length
}

// GET /reminders
export async function fetchReminders(): Promise<Reminder[]> {
  await delay()
  return reminders.map((reminder) => ({ ...reminder }))
}

// POST /reminders
export async function createReminder(values: { title: string; description: string | null; remindAt: string }): Promise<Reminder> {
  await delay()
  const created: Reminder = { id: nextReminderId++, done: false, doneAt: null, ...values }
  reminders = [...reminders, created]
  return { ...created }
}

// PATCH /reminders/:id (แก้ข้อความ/เวลา; เปลี่ยนเวลาแล้วถือเป็นการเตือนใหม่ = ยังไม่เสร็จ)
export async function updateReminder(
  id: number,
  values: { title: string; description: string | null; remindAt: string },
): Promise<Reminder> {
  await delay()
  const current = reminders.find((reminder) => reminder.id === id)
  if (!current) throw new Error('This reminder no longer exists.')
  const updated: Reminder = { ...current, ...values }
  reminders = reminders.map((reminder) => (reminder.id === id ? updated : reminder))
  return { ...updated }
}

// PATCH /reminders/:id/done (ติ๊กเสร็จ = ตั้ง doneAt, ยกเลิก = ล้าง)
export async function setReminderDone(id: number, done: boolean): Promise<Reminder> {
  await delay()
  const current = reminders.find((reminder) => reminder.id === id)
  if (!current) throw new Error('This reminder no longer exists.')
  const updated: Reminder = { ...current, done, doneAt: done ? new Date().toISOString() : null }
  reminders = reminders.map((reminder) => (reminder.id === id ? updated : reminder))
  return { ...updated }
}

// DELETE /reminders/:id
export async function deleteReminder(id: number): Promise<void> {
  await delay()
  if (!reminders.some((reminder) => reminder.id === id)) throw new Error('This reminder no longer exists.')
  reminders = reminders.filter((reminder) => reminder.id !== id)
}

// GET /tasks
export async function fetchTasks(): Promise<Task[]> {
  await delay()
  return tasks.map((task) => ({ ...task }))
}

// POST /tasks
export async function createTask(text: string): Promise<Task> {
  await delay()
  const created: Task = { id: nextTaskId++, text, done: false, createdAt: new Date().toISOString() }
  tasks = [...tasks, created]
  return { ...created }
}

// PATCH /tasks/:id
export async function setTaskDone(id: number, done: boolean): Promise<Task> {
  await delay()
  const current = tasks.find((task) => task.id === id)
  if (!current) throw new Error('This task no longer exists.')
  const updated: Task = { ...current, done }
  tasks = tasks.map((task) => (task.id === id ? updated : task))
  return { ...updated }
}

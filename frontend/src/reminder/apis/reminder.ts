import { request } from '../../shared/apis/client'
import type { Reminder, Task } from '../../shared/types/reminder'

type ReminderBody = { title: string; description: string | null; remindAt: string }

// GET /api/reminders  (เรียงตามเวลา)
export const fetchReminders = () => request<Reminder[]>('/api/reminders')

// GET /api/reminders/due-count  (badge ที่เมนู Reminder: ยังไม่เสร็จและถึงเวลาแล้ว)
export const countDueReminders = async () => (await request<{ count: number }>('/api/reminders/due-count')).count

// POST /api/reminders
export const createReminder = (values: ReminderBody) => request<Reminder>('/api/reminders', { method: 'POST', body: values })

// PUT /api/reminders/:id  (เปลี่ยนเวลา = การเตือนใหม่ ยังไม่เสร็จ)
export const updateReminder = (id: number, values: ReminderBody) =>
  request<Reminder>(`/api/reminders/${id}`, { method: 'PUT', body: values })

// PATCH /api/reminders/:id/done
export const setReminderDone = (id: number, done: boolean) =>
  request<Reminder>(`/api/reminders/${id}/done`, { method: 'PATCH', body: { done } })

// DELETE /api/reminders/:id
export const deleteReminder = (id: number) => request<void>(`/api/reminders/${id}`, { method: 'DELETE' })

// ===== task checkbox =====
export const fetchTasks = () => request<Task[]>('/api/tasks')
export const createTask = (text: string) => request<Task>('/api/tasks', { method: 'POST', body: { text } })
export const updateTaskText = (id: number, text: string) => request<Task>(`/api/tasks/${id}`, { method: 'PATCH', body: { text } })
export const setTaskDone = (id: number, done: boolean) => request<Task>(`/api/tasks/${id}`, { method: 'PATCH', body: { done } })
export const deleteTask = (id: number) => request<void>(`/api/tasks/${id}`, { method: 'DELETE' })

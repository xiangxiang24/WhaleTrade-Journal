import { useCallback, useEffect, useState } from 'react'
import {
  createReminder,
  createTask,
  deleteReminder,
  deleteTask,
  fetchReminders,
  fetchTasks,
  setReminderDone,
  setTaskDone,
  updateReminder,
  updateTaskText,
} from '../../shared/data/reminders'
import type { Reminder, Task } from '../../shared/types/reminder'
import type { ReminderLoadStatus } from './reminder'

const byTime = (a: Reminder, b: Reminder) => a.remindAt.localeCompare(b.remindAt)

// โหลดการเตือน + task พร้อมสถานะ loading / ready / error และการเพิ่ม/แก้/ลบ/ติ๊กเสร็จ
export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [status, setStatus] = useState<ReminderLoadStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchReminders(), fetchTasks()])
      .then(([loadedReminders, loadedTasks]) => {
        if (cancelled) return
        setReminders(loadedReminders.sort(byTime))
        setTasks(loadedTasks)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const reload = useCallback(() => {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }, [])

  const addReminder = useCallback(async (values: { title: string; description: string | null; remindAt: string }) => {
    const created = await createReminder(values)
    setReminders((current) => [...current, created].sort(byTime))
  }, [])

  const editReminder = useCallback(
    async (id: number, values: { title: string; description: string | null; remindAt: string }) => {
      const updated = await updateReminder(id, values)
      setReminders((current) => current.map((item) => (item.id === id ? updated : item)).sort(byTime))
    },
    [],
  )

  const removeReminder = useCallback(async (id: number) => {
    await deleteReminder(id)
    setReminders((current) => current.filter((item) => item.id !== id))
  }, [])

  const toggleReminder = useCallback(async (id: number, done: boolean) => {
    const updated = await setReminderDone(id, done)
    setReminders((current) => current.map((item) => (item.id === id ? updated : item)))
  }, [])

  const addTask = useCallback(async (text: string) => {
    const created = await createTask(text)
    setTasks((current) => [...current, created])
  }, [])

  const toggleTask = useCallback(async (id: number, done: boolean) => {
    const updated = await setTaskDone(id, done)
    setTasks((current) => current.map((item) => (item.id === id ? updated : item)))
  }, [])

  const editTask = useCallback(async (id: number, text: string) => {
    const updated = await updateTaskText(id, text)
    setTasks((current) => current.map((item) => (item.id === id ? updated : item)))
  }, [])

  const removeTask = useCallback(async (id: number) => {
    await deleteTask(id)
    setTasks((current) => current.filter((item) => item.id !== id))
  }, [])

  return { reminders, tasks, status, reload, addReminder, editReminder, removeReminder, toggleReminder, addTask, toggleTask, editTask, removeTask }
}

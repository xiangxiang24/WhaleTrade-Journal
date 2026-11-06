import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { BookOpen, Check, Paperclip, Plus, X } from 'lucide-react'
import type { Task } from '../../shared/types/reminder'
import { useI18n } from '../../shared/i18n/use-i18n'

type TodoCardProps = {
  tasks: Task[]
  onToggle: (task: Task) => void
  onAdd: (text: string) => Promise<void>
  /** แก้ข้อความ task (ดับเบิลคลิกที่ข้อความ) ถ้าไม่สำเร็จให้ throw Error */
  onEdit: (id: number, text: string) => Promise<void>
  onDelete: (task: Task) => void
}

const TASK_MAX = 200
const NOTE = 'Gentle To-Do List for reminding of sub-events'

// การ์ด Gentle To-Dos: task checkbox (ค้างก่อน เสร็จแล้วขีดฆ่าอยู่ท้าย) + ช่องเพิ่ม task + กล่องหมายเหตุ
export default function TodoCard({ tasks, onToggle, onAdd, onEdit, onDelete }: TodoCardProps) {
  const { t } = useI18n()
  const [text, setText] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string>()
  // task ที่กำลังแก้ข้อความ + ค่าที่พิมพ์ (ดับเบิลคลิกเข้า, Enter / คลิกออกเพื่อบันทึก, Esc ยกเลิก)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const cancelled = useRef(false)

  const pending = tasks.filter((task) => !task.done).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const done = tasks.filter((task) => task.done)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const value = text.trim()
    if (!value || adding) return
    setAdding(true)
    setError(undefined)
    try {
      await onAdd(value)
      setText('')
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : 'Could not add this task. Please try again.'))
    } finally {
      setAdding(false)
    }
  }

  function startEdit(task: Task) {
    cancelled.current = false
    setError(undefined)
    setDraft(task.text)
    setEditingId(task.id)
  }

  async function commitEdit(task: Task) {
    if (cancelled.current || editingId !== task.id) return
    const value = draft.trim()
    setEditingId(null)
    if (!value || value === task.text) return
    try {
      await onEdit(task.id, value)
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : 'Could not update this task. Please try again.'))
    }
  }

  function handleEditKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    } else if (event.key === 'Escape') {
      cancelled.current = true
      setEditingId(null)
    }
  }

  return (
    <div>
      <section aria-label={t('Gentle to-dos')} className="relative rounded-4xl bg-parchment p-5 shadow-md min-[640px]:p-6">
        {/* คลิปทองตกแต่งมุมบนขวา (กฎ: gold ใช้กับไอคอนคลิปเท่านั้น) */}
        <Paperclip
          size={30}
          strokeWidth={1.75}
          aria-hidden="true"
          className="absolute -top-2 right-6 text-gold-400"
        />
        <header>
          <h2 className="m-0 text-[22px] leading-7 font-bold text-navy-900">{t('Gentle To-Dos')}</h2>
          <p className="m-0 text-[13px] leading-5 text-text-muted">
            {t(pending.length === 1 ? 'Patience ledger • {n} action pending' : 'Patience ledger • {n} actions pending', { n: pending.length })}
          </p>
        </header>

        {tasks.length === 0 ? (
          <p className="m-0 mt-4 rounded-3xl bg-surface px-5 py-4 text-[14px] leading-6 text-text-muted">
            {t('No tasks yet. Add one quiet thing you want to remember.')}
          </p>
        ) : (
          <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
            {[...pending, ...done].map((task) => (
              <li
                key={task.id}
                className={`flex items-start gap-3 rounded-3xl py-2.5 pr-2 pl-4 text-[14px] leading-5 ${
                  task.done ? 'bg-green-50 text-text-muted' : 'bg-surface text-navy-900'
                }`}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={task.done}
                  aria-label={t('Mark “{name}” as done', { name: task.text })}
                  onClick={() => onToggle(task)}
                  data-no-bounce
                  className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-150 ${
                    task.done ? 'border-green-500 bg-green-500 text-surface' : 'border-blue-200 bg-blue-50 text-transparent'
                  }`}
                >
                  <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                </button>

                {editingId === task.id ? (
                  <input
                    autoFocus
                    value={draft}
                    maxLength={TASK_MAX}
                    aria-label={t('Edit task')}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => handleEditKey(event)}
                    onBlur={() => void commitEdit(task)}
                    className="-my-1 h-8 min-w-0 flex-1 rounded-pill border-2 border-blue-500 bg-surface px-3 text-[14px] text-navy-900 outline-none focus:shadow-focus"
                  />
                ) : (
                  <span
                    tabIndex={0}
                    title={t('Double-click to edit')}
                    onDoubleClick={() => startEdit(task)}
                    onKeyDown={(event) => {
                      if (event.key === 'F2') startEdit(task)
                    }}
                    className={`min-w-0 flex-1 cursor-text rounded-md whitespace-pre-line break-words outline-none focus-visible:shadow-focus ${
                      task.done ? 'line-through' : ''
                    }`}
                  >
                    {task.text}
                  </span>
                )}

                <button
                  type="button"
                  aria-label={t('Delete task “{name}”', { name: task.text })}
                  onClick={() => onDelete(task)}
                  className="-my-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-pill text-text-muted transition-colors duration-150 hover:bg-red-50 hover:text-red-500"
                >
                  <X size={16} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form noValidate onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t('Add a quiet task')}</span>
            <input
              value={text}
              maxLength={TASK_MAX}
              onChange={(event) => setText(event.target.value)}
              placeholder={t('Add a quiet task…')}
              className="h-11 w-full rounded-pill border-2 border-blue-500 bg-surface px-4 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus"
            />
          </label>
          <button
            type="submit"
            disabled={!text.trim() || adding}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-pill bg-blue-500 px-5 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:shadow-none"
          >
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            {adding ? t('Adding…') : t('Add')}
          </button>
        </form>
        {error && (
          <p role="alert" className="m-0 mt-2 text-[13px] leading-5 text-navy-900">
            {error}
          </p>
        )}
      </section>

      <p className="m-0 mt-4 flex items-center gap-3 rounded-3xl bg-blue-50 px-5 py-4 text-[13px] leading-5 text-navy-700">
        <BookOpen size={18} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
        {t(NOTE)}
      </p>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { BookOpen, Check, Paperclip, Plus } from 'lucide-react'
import type { Task } from '../../shared/types/reminder'

type TodoCardProps = {
  tasks: Task[]
  onToggle: (task: Task) => void
  onAdd: (text: string) => Promise<void>
}

const TASK_MAX = 200
const NOTE = 'Gentle To-Do List for reminding of sub-events'

// การ์ด Gentle To-Dos: task checkbox (ค้างก่อน เสร็จแล้วขีดฆ่าอยู่ท้าย) + ช่องเพิ่ม task + กล่องหมายเหตุ
export default function TodoCard({ tasks, onToggle, onAdd }: TodoCardProps) {
  const [text, setText] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string>()

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
      setError(caught instanceof Error ? caught.message : 'Could not add this task. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div>
      <section aria-label="Gentle to-dos" className="relative rounded-4xl bg-parchment p-5 shadow-md min-[640px]:p-6">
        {/* คลิปทองตกแต่งมุมบนขวา (กฎ: gold ใช้กับไอคอนคลิปเท่านั้น) */}
        <Paperclip
          size={30}
          strokeWidth={1.75}
          aria-hidden="true"
          className="absolute -top-2 right-6 text-gold-400"
        />
        <header>
          <h2 className="m-0 text-[22px] leading-7 font-bold text-navy-900">Gentle To-Dos</h2>
          <p className="m-0 text-[13px] leading-5 text-text-muted">
            Patience ledger • {pending.length} {pending.length === 1 ? 'action' : 'actions'} pending
          </p>
        </header>

        {tasks.length === 0 ? (
          <p className="m-0 mt-4 rounded-3xl bg-surface px-5 py-4 text-[14px] leading-6 text-text-muted">
            No tasks yet. Add one quiet thing you want to remember.
          </p>
        ) : (
          <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
            {[...pending, ...done].map((task) => (
              <li key={task.id}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-3xl px-4 py-3 text-[14px] leading-5 ${
                    task.done ? 'bg-green-50 text-text-muted line-through' : 'bg-surface text-navy-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => onToggle(task)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`mt-px inline-flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500 ${
                      task.done ? 'border-green-500 bg-green-500 text-surface' : 'border-blue-200 bg-blue-50 text-transparent'
                    }`}
                  >
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0 whitespace-pre-line break-words">{task.text}</span>
                </label>
              </li>
            ))}
          </ul>
        )}

        <form noValidate onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Add a quiet task</span>
            <input
              value={text}
              maxLength={TASK_MAX}
              onChange={(event) => setText(event.target.value)}
              placeholder="Add a quiet task…"
              className="h-11 w-full rounded-pill border-2 border-blue-500 bg-surface px-4 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus"
            />
          </label>
          <button
            type="submit"
            disabled={!text.trim() || adding}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-pill bg-blue-500 px-5 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:shadow-none"
          >
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            {adding ? 'Adding…' : 'Add'}
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
        {NOTE}
      </p>
    </div>
  )
}

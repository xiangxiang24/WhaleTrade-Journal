import { useId, useMemo, useState, type FormEvent } from 'react'
import { CircleAlert, Trash2 } from 'lucide-react'
import type { NoteFormValues } from '../types/note-form'
import { contentToPlainText, isContentEmpty } from '../note-editor/content'
import NoteEditor from '../note-editor/note-editor'
import { countWords } from './count-words'
import MoodPicker from './mood-picker'

type NoteFormProps = {
  /** ค่าเริ่มต้น (โน้ตใหม่ = ว่าง, แก้โน้ตเดิม = ค่าที่มีอยู่) */
  initialValues?: NoteFormValues
  /** บันทึก: ถ้าไม่สำเร็จให้ throw Error พร้อมข้อความที่จะแสดง */
  onSubmit: (values: NoteFormValues) => Promise<void>
  onCancel: () => void
  /** ส่งมาเฉพาะตอนแก้โน้ตเดิม จะแสดงปุ่ม Delete note ทางซ้ายล่าง */
  onDelete?: () => void
  submitLabel?: string
}

const EMPTY: NoteFormValues = { title: '', content: '', emotion: null }
const TITLE_MAX = 120

const LABEL = 'text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase'

// ฟอร์มสร้าง/แก้โน้ต: เลือกอารมณ์ (ไม่บังคับ) → TITLE (ไม่บังคับ) → REFLECTIVE THOUGHTS (บังคับ) → ปุ่ม
export default function NoteForm({
  initialValues = EMPTY,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel = 'Save Changes',
}: NoteFormProps) {
  const [emotion, setEmotion] = useState(initialValues.emotion)
  const [title, setTitle] = useState(initialValues.title)
  const [content, setContent] = useState(initialValues.content)
  const [contentError, setContentError] = useState<string>()
  const [formError, setFormError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const titleId = useId()
  const contentId = useId()
  const contentLabelId = useId()

  const wordCount = useMemo(() => countWords(contentToPlainText(content)), [content])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    if (isContentEmpty(content)) {
      setContentError('Please write a few thoughts before saving.')
      return
    }
    setContentError(undefined)
    setFormError(undefined)
    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), content, emotion })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not save your note. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
      <MoodPicker value={emotion} onChange={setEmotion} />

      <div>
        <label htmlFor={titleId} className={`block ${LABEL}`}>
          Title
        </label>
        <input
          id={titleId}
          data-autofocus
          type="text"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Today Journal"
          className="mt-1.5 h-12 w-full rounded-pill border-2 border-blue-500 bg-surface px-5 text-[17px] leading-6 font-semibold text-navy-900 outline-none transition-shadow duration-150 placeholder:font-medium placeholder:text-text-muted focus:shadow-focus short:h-11"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <span id={contentLabelId} className={LABEL}>
            Reflective thoughts
          </span>
          <span className="text-[12px] leading-4 text-text-muted tabular-nums" aria-live="polite">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
        <div className="mt-1.5">
          <NoteEditor
            value={content}
            onChange={(next) => {
              setContent(next)
              if (contentError) setContentError(undefined)
            }}
            labelledBy={contentLabelId}
            describedBy={contentError ? `${contentId}-error` : undefined}
            invalid={Boolean(contentError)}
            minHeightClass="min-h-52 short:min-h-36"
          />
        </div>
        {contentError && (
          <p
            id={`${contentId}-error`}
            className="m-0 mt-1.5 flex items-start gap-1.5 text-[12px] leading-4 text-navy-900"
          >
            <CircleAlert size={14} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0 text-red-500" />
            {contentError}
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" className="m-0 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
          <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
          {formError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-11 items-center gap-2 rounded-pill border-2 border-red-500 bg-surface px-5 text-[14px] leading-5 font-semibold text-red-500 transition-colors duration-150 hover:bg-red-50 active:bg-red-50"
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
            Delete note
          </button>
        ) : (
          <span />
        )}
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center rounded-pill border-2 border-blue-200 bg-surface px-6 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center rounded-pill bg-blue-500 px-6 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:shadow-none"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}

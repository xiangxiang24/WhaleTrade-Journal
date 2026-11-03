import { useEffect, useId, useState, type FormEvent } from 'react'
import { CircleAlert, Trash2 } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import type { Reminder, ReminderFormValues } from '../../shared/types/reminder'
import { dayKey, timeKey } from '../types/datetime'
import { useI18n } from '../../shared/i18n/use-i18n'

type ReminderFormModalProps = {
  open: boolean
  /** มีค่า = แก้การเตือนเดิม, ว่าง = ตั้งใหม่ */
  reminder?: Reminder | null
  /** วันที่เริ่มต้นของการเตือนใหม่ (วันที่เลือกในปฏิทิน) YYYY-MM-DD */
  defaultDate: string
  timeZone: string
  /** บันทึก: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงเหนือปุ่ม) */
  onSubmit: (values: ReminderFormValues) => Promise<void>
  /** กด Delete reminder (เฉพาะตอนแก้) ผู้เรียกเปิด modal ยืนยันต่อ */
  onDelete?: (reminder: Reminder) => void
  onClose: () => void
}

const EXIT_MS = 200
const TITLE_MAX = 80
const DESCRIPTION_MAX = 200
const DEFAULT_TIME = '09:00'

type Errors = { title?: string; description?: string; date?: string; time?: string }

const inputClass = (invalid: boolean) =>
  `h-11 short:h-10 w-full rounded-pill border-2 bg-surface px-4 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus ${
    invalid ? 'border-red-500' : 'border-blue-500'
  }`

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="m-0 mt-1.5 flex items-start gap-1.5 text-[12px] leading-4 text-navy-900">
      <CircleAlert size={14} strokeWidth={1.75} className="mt-px shrink-0 text-red-500" aria-hidden="true" />
      {children}
    </p>
  )
}

function Dialog({ reminder, defaultDate, timeZone, onSubmit, onDelete, onClose }: Omit<ReminderFormModalProps, 'open'>) {
  const { t } = useI18n()
  const editing = Boolean(reminder)
  const [title, setTitle] = useState(reminder?.title ?? '')
  const [description, setDescription] = useState(reminder?.description ?? '')
  const [date, setDate] = useState(reminder ? dayKey(reminder.remindAt, timeZone) : defaultDate)
  const [time, setTime] = useState(reminder ? timeKey(reminder.remindAt, timeZone) : DEFAULT_TIME)
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const descId = useId()
  const fieldTitle = useId()
  const fieldDescription = useId()
  const fieldDate = useId()
  const fieldTime = useId()

  useEffect(() => {
    document.getElementById(fieldTitle)?.focus()
  }, [fieldTitle])

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    const found: Errors = {}
    if (!title.trim()) found.title = t('Please give this reminder a title.')
    else if (title.trim().length > TITLE_MAX) found.title = t('Keep the title within {n} characters.', { n: TITLE_MAX })
    if (description.trim().length > DESCRIPTION_MAX) found.description = t('Keep the note within {n} characters.', { n: DESCRIPTION_MAX })
    if (!date) found.date = t('Pick a date.')
    if (!time) found.time = t('Pick a time.')
    setErrors(found)
    setSubmitError(undefined)
    if (Object.keys(found).length > 0) return
    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), date, time })
      setClosing(true)
    } catch (caught) {
      setSubmitError(t(caught instanceof Error ? caught.message : 'Could not save this reminder. Please try again.'))
      setSubmitting(false)
    }
  }

  return (
    <ModalFrame
      titleId={titleId}
      descId={descId}
      closing={closing}
      onRequestClose={() => {
        if (!submitting) setClosing(true)
      }}
      cardClassName="max-w-130 p-5 text-left min-[640px]:p-8"
    >
      <h2 id={titleId} className="m-0 text-[24px] leading-8 font-bold text-navy-900 min-[640px]:text-[28px] min-[640px]:leading-9">
        {editing ? t('Edit Reminder') : t('New Reminder')}
      </h2>
      <p id={descId} className="m-0 mt-1 mb-5 text-[14px] leading-5 text-text-muted">
        {t('A short note with the day and time you want to be reminded.')}
      </p>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor={fieldTitle} className="block text-[12px] leading-4 font-semibold text-navy-900">
            {t('Title')}
          </label>
          <input
            id={fieldTitle}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('e.g. SCB Ex-Dividend Date (XD)')}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? `${fieldTitle}-error` : undefined}
            className={`${inputClass(Boolean(errors.title))} mt-1.5`}
          />
          {errors.title && <FieldError id={`${fieldTitle}-error`}>{errors.title}</FieldError>}
        </div>

        <div>
          <label htmlFor={fieldDescription} className="block text-[12px] leading-4 font-semibold text-navy-900">
            {t('Note (optional)')}
          </label>
          <textarea
            id={fieldDescription}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('Six months in. Are my reasons for buying still true?')}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? `${fieldDescription}-error` : undefined}
            className={`mt-1.5 w-full resize-none rounded-md border-2 bg-surface px-4 py-3 text-[14px] leading-5 text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus ${
              errors.description ? 'border-red-500' : 'border-blue-500'
            }`}
          />
          {errors.description && <FieldError id={`${fieldDescription}-error`}>{errors.description}</FieldError>}
        </div>

        <div className="grid gap-4 min-[640px]:grid-cols-2">
          <div>
            <label htmlFor={fieldDate} className="block text-[12px] leading-4 font-semibold text-navy-900">
              {t('Date')}
            </label>
            <input
              id={fieldDate}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? `${fieldDate}-error` : undefined}
              className={`${inputClass(Boolean(errors.date))} mt-1.5`}
            />
            {errors.date && <FieldError id={`${fieldDate}-error`}>{errors.date}</FieldError>}
          </div>
          <div>
            <label htmlFor={fieldTime} className="block text-[12px] leading-4 font-semibold text-navy-900">
              {t('Time')}
            </label>
            <input
              id={fieldTime}
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              aria-invalid={Boolean(errors.time)}
              aria-describedby={errors.time ? `${fieldTime}-error` : undefined}
              className={`${inputClass(Boolean(errors.time))} mt-1.5`}
            />
            {errors.time && <FieldError id={`${fieldTime}-error`}>{errors.time}</FieldError>}
          </div>
        </div>

        {submitError && (
          <p role="alert" className="m-0 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
            {submitError}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          {editing && reminder && onDelete ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() => onDelete(reminder)}
              className="inline-flex h-11 items-center gap-2 rounded-pill border-2 border-red-500 bg-surface px-5 text-[14px] leading-5 font-semibold text-red-500 transition-colors duration-150 hover:bg-red-50 active:bg-red-500 active:text-surface disabled:opacity-50"
            >
              <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
              {t('Delete')}
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setClosing(true)}
              className="inline-flex h-11 items-center rounded-pill border-2 border-blue-200 bg-surface px-6 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center rounded-pill bg-blue-500 px-6 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:shadow-none"
            >
              {submitting ? t('Saving…') : editing ? t('Save Changes') : t('Set Reminder')}
            </button>
          </div>
        </div>
      </form>
    </ModalFrame>
  )
}

// modal ตั้ง/แก้การเตือน (mount เฉพาะตอนเปิด ให้ฟอร์มเริ่มใหม่ทุกครั้ง)
export default function ReminderFormModal({ open, ...props }: ReminderFormModalProps) {
  return open ? <Dialog {...props} /> : null
}

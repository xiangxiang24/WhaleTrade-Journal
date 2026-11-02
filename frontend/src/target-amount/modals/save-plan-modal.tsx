import { useEffect, useId, useState, type FormEvent } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'

type SavePlanModalProps = {
  open: boolean
  defaultName: string
  /** บันทึกแผน: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงในกล่อง) */
  onSubmit: (name: string) => Promise<void>
  onClose: () => void
}

const EXIT_MS = 200
const NAME_MAX = 60

function Dialog({ defaultName, onSubmit, onClose }: Omit<SavePlanModalProps, 'open'>) {
  const [name, setName] = useState(defaultName)
  const [error, setError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const descId = useId()
  const inputId = useId()

  useEffect(() => {
    document.getElementById(inputId)?.focus()
  }, [inputId])

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    const value = name.trim()
    if (!value) return setError('Please name your plan.')
    if (value.length > NAME_MAX) return setError(`Keep the name within ${NAME_MAX} characters.`)
    setError(undefined)
    setSubmitError(undefined)
    setSubmitting(true)
    try {
      await onSubmit(value)
      setClosing(true)
    } catch (caught) {
      setSubmitError(caught instanceof Error ? caught.message : 'Could not save this plan. Please try again.')
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
      cardClassName="max-w-110 p-5 text-left min-[640px]:p-8"
    >
      <h2 id={titleId} className="m-0 text-[24px] leading-8 font-bold text-navy-900">
        Save plan
      </h2>
      <p id={descId} className="m-0 mt-1 mb-5 text-[14px] leading-5 text-text-muted">
        Keep this plan in your Saved Plans so you can open it again later.
      </p>

      <form noValidate onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="block text-[12px] leading-4 font-semibold text-navy-900">
          Plan name
        </label>
        <input
          id={inputId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. 10-year quiet sanctuary"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`mt-1.5 h-11 w-full rounded-pill border-2 bg-surface px-4 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus ${
            error ? 'border-red-500' : 'border-blue-500'
          }`}
        />
        {error && (
          <p id={`${inputId}-error`} className="m-0 mt-1.5 flex items-start gap-1.5 text-[12px] leading-4 text-navy-900">
            <CircleAlert size={14} strokeWidth={1.75} className="mt-px shrink-0 text-red-500" aria-hidden="true" />
            {error}
          </p>
        )}
        {submitError && (
          <p role="alert" className="m-0 mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
            {submitError}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => setClosing(true)}
            className="inline-flex h-11 items-center rounded-pill border-2 border-blue-200 bg-surface px-6 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center rounded-pill bg-blue-500 px-6 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:shadow-none"
          >
            {submitting ? 'Saving…' : 'Save plan'}
          </button>
        </div>
      </form>
    </ModalFrame>
  )
}

// modal ตั้งชื่อและบันทึกแผน (mount เฉพาะตอนเปิด)
export default function SavePlanModal({ open, ...props }: SavePlanModalProps) {
  return open ? <Dialog {...props} /> : null
}

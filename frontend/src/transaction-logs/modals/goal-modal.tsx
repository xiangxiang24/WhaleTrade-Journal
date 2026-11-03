import { useEffect, useId, useState, type FormEvent } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import { formatBaht } from '../types/format'
import { useI18n } from '../../shared/i18n/use-i18n'

type GoalModalProps = {
  open: boolean
  /** เป้าหมายเดิม (ว่าง = ยังไม่ตั้ง) */
  goal: number | null
  /** บันทึก: null = เอาเป้าหมายออก ถ้าไม่สำเร็จให้ throw Error */
  onSubmit: (goal: number | null) => Promise<void>
  onClose: () => void
}

const EXIT_MS = 200
const GOAL_MAX = 999_999_999_999

function Dialog({ goal, onSubmit, onClose }: Omit<GoalModalProps, 'open'>) {
  const { t } = useI18n()
  const [text, setText] = useState(goal ? formatBaht(goal) : '')
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

  async function save(value: number | null) {
    setSubmitting(true)
    setSubmitError(undefined)
    try {
      await onSubmit(value)
      setClosing(true)
    } catch (caught) {
      setSubmitError(t(caught instanceof Error ? caught.message : 'Could not save the goal. Please try again.'))
      setSubmitting(false)
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    const digits = text.replace(/\D/g, '')
    const value = digits ? Number(digits) : null
    if (value === null || value <= 0 || value > GOAL_MAX) {
      setError(t('Enter a yearly goal greater than 0.'))
      return
    }
    setError(undefined)
    void save(value)
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
        {goal ? t('Edit annual goal') : t('Set annual goal')}
      </h2>
      <p id={descId} className="m-0 mt-1 mb-5 text-[14px] leading-5 text-text-muted">
        {t('The yearly dividend income you are growing toward. Progress is counted from dividends you have recorded.')}
      </p>

      <form noValidate onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="block text-[12px] leading-4 font-semibold text-navy-900">
          {t('Annual dividend goal')}
        </label>
        <div className="relative mt-1.5">
          <input
            id={inputId}
            inputMode="numeric"
            autoComplete="off"
            value={text}
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, '').slice(0, 12)
              setText(digits ? formatBaht(Number(digits)) : '')
            }}
            placeholder="250,000"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`h-11 short:h-10 w-full rounded-pill border-2 bg-surface pr-24 pl-4 text-right text-[14px] text-navy-900 tabular-nums outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus ${
              error ? 'border-red-500' : 'border-blue-500'
            }`}
          />
          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[13px] font-semibold text-text-muted">
            {t('THB / year')}
          </span>
        </div>
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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {goal ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() => void save(null)}
              className="inline-flex h-11 items-center rounded-pill border-2 border-red-500 bg-surface px-5 text-[14px] leading-5 font-semibold text-red-500 transition-colors duration-150 hover:bg-red-50 disabled:opacity-50"
            >
              {t('Remove goal')}
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
              {submitting ? t('Saving…') : t('Save goal')}
            </button>
          </div>
        </div>
      </form>
    </ModalFrame>
  )
}

// modal ตั้ง/แก้/เอาเป้าหมายต่อปีออก (mount เฉพาะตอนเปิด)
export default function GoalModal({ open, ...props }: GoalModalProps) {
  return open ? <Dialog {...props} /> : null
}

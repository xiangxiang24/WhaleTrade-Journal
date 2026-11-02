import { useEffect, useId, useState, type FormEvent } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import type { Portfolio, PortfolioFormValues, PortfolioIconKey } from '../../shared/types/portfolio'
import { FieldError, TextField } from '../../onboarding/components/auth-field'
import { PORTFOLIO_ICONS } from '../types/portfolio-icons'
import { formatAmount } from '../types/format'

type PortfolioFormModalProps = {
  open: boolean
  /** มีค่า = แก้พอร์ตเดิม, ว่าง = สร้างพอร์ตใหม่ */
  portfolio?: Portfolio | null
  /** บันทึก: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงเหนือปุ่ม) */
  onSubmit: (values: PortfolioFormValues) => Promise<void>
  /** เรียกเมื่อ modal ปิดเสร็จ (บันทึกสำเร็จ, กด Cancel หรือกด Esc) */
  onClose: () => void
}

const EXIT_MS = 200
const NAME_MAX = 40
const TAGLINE_MAX = 48
const DESCRIPTION_MAX = 160
const GOAL_MAX = 999_999_999_999

type Errors = { name?: string; tagline?: string; description?: string; goal?: string }

function Dialog({ portfolio, onSubmit, onClose }: Omit<PortfolioFormModalProps, 'open'>) {
  const editing = Boolean(portfolio)
  const [name, setName] = useState(portfolio?.name ?? '')
  const [tagline, setTagline] = useState(portfolio?.tagline ?? '')
  const [description, setDescription] = useState(portfolio?.description ?? '')
  const [goalText, setGoalText] = useState(portfolio?.annualGoal ? formatAmount(portfolio.annualGoal) : '')
  const [icon, setIcon] = useState<PortfolioIconKey>(portfolio?.icon ?? 'leaf')
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const descId = useId()
  const nameId = useId()
  const taglineId = useId()
  const descriptionId = useId()
  const goalId = useId()
  const goalErrorId = `${goalId}-error`

  useEffect(() => {
    document.getElementById(nameId)?.focus()
  }, [nameId])

  // รอให้แอนิเมชันออกเล่นจบก่อนค่อยแจ้งผู้เรียก
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  // ตรวจตอนกดบันทึกเท่านั้น (design rules 14.7)
  function validate(): { errors: Errors; goal: number | null } {
    const found: Errors = {}
    const trimmedName = name.trim()
    if (!trimmedName) found.name = 'Please give your portfolio a name.'
    else if (trimmedName.length > NAME_MAX) found.name = `Keep the name within ${NAME_MAX} characters.`
    if (tagline.trim().length > TAGLINE_MAX) found.tagline = `Keep the description within ${TAGLINE_MAX} characters.`
    if (description.trim().length > DESCRIPTION_MAX) found.description = `Keep the story within ${DESCRIPTION_MAX} characters.`
    const digits = goalText.replace(/\D/g, '')
    const goal = digits ? Number(digits) : null
    if (goal !== null && (goal <= 0 || goal > GOAL_MAX)) found.goal = 'Enter a goal greater than 0.'
    return { errors: found, goal }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    const result = validate()
    setErrors(result.errors)
    setSubmitError(undefined)
    if (Object.keys(result.errors).length > 0) return
    setSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), tagline: tagline.trim(), description: description.trim(), icon, annualGoal: result.goal })
      setClosing(true)
    } catch (caught) {
      setSubmitError(caught instanceof Error ? caught.message : 'Could not save this portfolio. Please try again.')
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
        {editing ? 'Edit Portfolio' : 'Create Portfolio'}
      </h2>
      <p id={descId} className="m-0 mt-1 mb-5 text-[14px] leading-5 text-text-muted">
        {editing
          ? 'Rename it or adjust the yearly goal. Your transactions stay untouched.'
          : 'Give your new garden a name and a yearly dividend goal.'}
      </p>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          id={nameId}
          label="Portfolio name"
          value={name}
          onChange={setName}
          error={errors.name}
          placeholder="e.g. Dividend Sanctuary"
        />
        <TextField
          id={taglineId}
          label="Short description (optional)"
          value={tagline}
          onChange={setTagline}
          error={errors.tagline}
          placeholder="e.g. Anchor Portfolio"
        />

        <div>
          <label htmlFor={descriptionId} className="block text-[12px] leading-4 font-semibold text-navy-900">
            About this portfolio (optional)
          </label>
          <textarea
            id={descriptionId}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="A few words about why this garden exists"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? `${descriptionId}-error` : undefined}
            className={`mt-1.5 w-full resize-none rounded-md border-2 bg-surface px-4 py-3 text-[14px] leading-5 text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus ${
              errors.description ? 'border-red-500' : 'border-blue-500'
            }`}
          />
          {errors.description && <FieldError id={`${descriptionId}-error`}>{errors.description}</FieldError>}
        </div>

        <div>
          <label htmlFor={goalId} className="block text-[12px] leading-4 font-semibold text-navy-900">
            Annual goal (optional)
          </label>
          <div className="relative mt-1.5">
            <input
              id={goalId}
              inputMode="numeric"
              autoComplete="off"
              value={goalText}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, '').slice(0, 12)
                setGoalText(digits ? formatAmount(Number(digits)) : '')
              }}
              placeholder="2,000,000"
              aria-invalid={Boolean(errors.goal)}
              aria-describedby={errors.goal ? goalErrorId : undefined}
              className={`h-11 short:h-10 w-full rounded-pill border-2 bg-surface pr-16 pl-4 text-right text-[14px] text-navy-900 tabular-nums outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus ${
                errors.goal ? 'border-red-500' : 'border-blue-500'
              }`}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[13px] font-semibold text-text-muted"
            >
              THB
            </span>
          </div>
          {errors.goal && <FieldError id={goalErrorId}>{errors.goal}</FieldError>}
        </div>

        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="p-0 text-[12px] leading-4 font-semibold text-navy-900">Icon</legend>
          <div role="radiogroup" aria-label="Portfolio icon" className="mt-1.5 flex flex-wrap gap-2">
            {PORTFOLIO_ICONS.map(({ key, label, icon: Icon }) => {
              const selected = icon === key
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={label}
                  title={label}
                  onClick={() => setIcon(key)}
                  className={`inline-flex size-12 items-center justify-center rounded-pill border-2 text-navy-700 transition-colors duration-150 ${
                    selected ? 'border-blue-500 bg-blue-100' : 'border-transparent bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </fieldset>

        {submitError && (
          <p role="alert" className="m-0 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
            {submitError}
          </p>
        )}

        <div className="mt-2 flex flex-wrap justify-end gap-3">
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
            {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Portfolio'}
          </button>
        </div>
      </form>
    </ModalFrame>
  )
}

// modal สร้าง/แก้พอร์ต: ชื่อ + คำอธิบายสั้น + เป้าหมายต่อปี + ไอคอน (mount เฉพาะตอนเปิด ให้ฟอร์มเริ่มใหม่ทุกครั้ง)
export default function PortfolioFormModal({ open, ...props }: PortfolioFormModalProps) {
  return open ? <Dialog {...props} /> : null
}

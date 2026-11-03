import { useEffect, useId, useState, type FormEvent } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import { PasswordField } from '../../onboarding/components/auth-field'
import { MIN_PASSWORD_LENGTH } from '../../onboarding/components/auth-validation'

type ChangePasswordModalProps = {
  open: boolean
  /** เปลี่ยนรหัสผ่าน: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงเหนือปุ่ม) */
  onSubmit: (current: string, next: string) => Promise<void>
  onClose: () => void
}

const EXIT_MS = 200

type Errors = { current?: string; next?: string; confirm?: string }

function Dialog({ onSubmit, onClose }: Omit<ChangePasswordModalProps, 'open'>) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const descId = useId()
  const currentId = useId()
  const nextId = useId()
  const confirmId = useId()

  useEffect(() => {
    document.getElementById(currentId)?.focus()
  }, [currentId])

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    const found: Errors = {}
    if (!current) found.current = 'Enter your current password.'
    if (next.length < MIN_PASSWORD_LENGTH) found.next = `Use at least ${MIN_PASSWORD_LENGTH} characters.`
    else if (next === current) found.next = 'Choose a password different from your current one.'
    if (confirm !== next) found.confirm = 'The passwords do not match.'
    setErrors(found)
    setSubmitError(undefined)
    if (Object.keys(found).length > 0) return
    setSubmitting(true)
    try {
      await onSubmit(current, next)
      setClosing(true)
    } catch (caught) {
      setSubmitError(caught instanceof Error ? caught.message : 'Could not change your password. Please try again.')
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
        Change password
      </h2>
      <p id={descId} className="m-0 mt-1 mb-5 text-[14px] leading-5 text-text-muted">
        Enter your current password, then choose a new one.
      </p>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordField id={currentId} label="Current password" value={current} onChange={setCurrent} error={errors.current} autoComplete="current-password" />
        <PasswordField id={nextId} label="New password" value={next} onChange={setNext} error={errors.next} autoComplete="new-password" />
        <PasswordField id={confirmId} label="Confirm new password" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" />
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
            {submitting ? 'Saving…' : 'Update password'}
          </button>
        </div>
      </form>
    </ModalFrame>
  )
}

// modal เปลี่ยนรหัสผ่าน: รหัสเดิม + รหัสใหม่ + ยืนยันรหัสใหม่ (mount เฉพาะตอนเปิด)
export default function ChangePasswordModal({ open, ...props }: ChangePasswordModalProps) {
  return open ? <Dialog {...props} /> : null
}

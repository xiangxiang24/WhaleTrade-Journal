import { useEffect, useId, useState, type FormEvent } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import { PasswordField, TextField } from '../../onboarding/components/auth-field'
import { EMAIL_PATTERN } from '../../onboarding/components/auth-validation'
import { useI18n } from '../../shared/i18n/use-i18n'

type ChangeEmailModalProps = {
  open: boolean
  currentEmail: string
  /** เปลี่ยนอีเมล: ถ้าไม่สำเร็จให้ throw Error (รหัสผ่านผิด / อีเมลซ้ำ) */
  onSubmit: (email: string, password: string) => Promise<void>
  onClose: () => void
}

const EXIT_MS = 200

type Errors = { email?: string; password?: string }

function Dialog({ currentEmail, onSubmit, onClose }: Omit<ChangeEmailModalProps, 'open'>) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const descId = useId()
  const emailId = useId()
  const passwordId = useId()

  useEffect(() => {
    document.getElementById(emailId)?.focus()
  }, [emailId])

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    const value = email.trim()
    const found: Errors = {}
    if (!EMAIL_PATTERN.test(value)) found.email = t('Enter a valid email address.')
    else if (value.toLowerCase() === currentEmail.toLowerCase()) found.email = t('This is already your email.')
    if (!password) found.password = t('Enter your current password to confirm.')
    setErrors(found)
    setSubmitError(undefined)
    if (Object.keys(found).length > 0) return
    setSubmitting(true)
    try {
      await onSubmit(value, password)
      setClosing(true)
    } catch (caught) {
      setSubmitError(t(caught instanceof Error ? caught.message : 'Could not change your email. Please try again.'))
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
        {t('Change email')}
      </h2>
      <p id={descId} className="m-0 mt-1 mb-5 text-[14px] leading-5 text-text-muted">
        {t('Your email is your login name. Confirm with your current password to change it.')}
      </p>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField id={emailId} type="email" label={t('New email')} value={email} onChange={setEmail} error={errors.email} autoComplete="email" placeholder="you@example.com" />
        <PasswordField id={passwordId} label={t('Current password')} value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" />
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
            {t('Cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center rounded-pill bg-blue-500 px-6 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:shadow-none"
          >
            {submitting ? t('Saving…') : t('Update email')}
          </button>
        </div>
      </form>
    </ModalFrame>
  )
}

// modal เปลี่ยนอีเมล: อีเมลใหม่ + รหัสผ่านปัจจุบัน (mount เฉพาะตอนเปิด)
export default function ChangeEmailModal({ open, ...props }: ChangeEmailModalProps) {
  return open ? <Dialog {...props} /> : null
}

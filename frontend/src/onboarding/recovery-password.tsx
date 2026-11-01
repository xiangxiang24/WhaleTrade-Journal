import { useCallback, useState, type FormEvent } from 'react'
import keyWhale from '../assets/Key.png'
import BackButton from './components/back-button'
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from './components/auth-validation'
import { FieldError, PasswordField, TextField } from './components/auth-field'
import OnboardingButton from './components/onboarding-button'
import OnboardingHeader from './components/onboarding-header'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import ResetPasswordSuccessModal from './modals/reset-password-success-modal'
import type { RecoveryPasswordData, RecoveryPasswordErrors } from './types/recovery-password'

type RecoveryPasswordProps = {
  /** ตั้งรหัสผ่านใหม่กับ backend ด้วยอีเมล + รหัสกู้คืน: ถ้าไม่สำเร็จให้ throw Error พร้อมข้อความที่จะแสดง */
  onResetPassword?: (data: RecoveryPasswordData) => Promise<void>
  /** เรียกเมื่อ modal "Reset Password Successful" ปิดแล้ว ให้ผู้เรียกพาไปหน้า Login */
  onSuccess?: () => void
  onBack?: () => void
}

function validate(
  { email, recoveryCode, newPassword }: RecoveryPasswordData,
  confirmPassword: string,
): RecoveryPasswordErrors {
  const errors: RecoveryPasswordErrors = {}
  if (!email) errors.email = 'Please enter your email.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address.'
  if (!recoveryCode) errors.recoveryCode = 'Please enter your recovery code.'
  if (!newPassword) errors.newPassword = 'Please enter a new password.'
  else if (newPassword.length < MIN_PASSWORD_LENGTH)
    errors.newPassword = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your new password.'
  else if (newPassword && confirmPassword !== newPassword)
    errors.confirmPassword = 'Passwords do not match.'
  return errors
}

// หน้า Recovery Password (ลืมรหัสผ่าน): ยืนยันด้วยอีเมล + รหัสกู้คืน แล้วตั้งรหัสผ่านใหม่ สำเร็จแล้วไปหน้า Login
export default function RecoveryPassword({ onResetPassword, onSuccess, onBack }: RecoveryPasswordProps) {
  const [email, setEmail] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<RecoveryPasswordErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const { leaving, leaveTo } = usePageLeave()

  // modal ปิดแล้ว: เนื้อหาหน้าลอยออกก่อนไปหน้า Login
  const handleSuccessClose = useCallback(() => {
    setSuccessOpen(false)
    leaveTo(onSuccess)
  }, [onSuccess, leaveTo])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    const data = { email: email.trim(), recoveryCode: recoveryCode.trim(), newPassword }
    const found = validate(data, confirmPassword)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await onResetPassword?.(data)
      setSuccessOpen(true)
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Reset failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface px-8 min-[1280px]:px-15">
      <OnboardingHeader />

      <div className={`flex flex-1 flex-col ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
        <div className="mt-8 short:mt-4 animate-fade-up motion-reduce:animate-none">
          <BackButton onClick={() => leaveTo(onBack)} />
        </div>

        <main className="flex flex-1 flex-col items-center justify-center pt-4 pb-8 short:pt-2 short:pb-4">
          <form
            noValidate
            onSubmit={handleSubmit}
            className="w-full max-w-146 animate-fade-up rounded-4xl border border-line bg-surface px-8 py-10 shadow-md [animation-delay:100ms] short:p-6 min-[700px]:px-19 motion-reduce:animate-none"
          >
            {/* วาฬถือกุญแจ: ย่อตามความสูงหน้าต่าง */}
            <img
              className="mx-auto h-[clamp(96px,calc(100vh_-_700px),280px)] w-auto animate-float motion-reduce:animate-none"
              src={keyWhale}
              alt=""
            />
            {/* หัวข้อกว้างกว่าช่องกรอก (ตาม Figma) จึงดึงออกด้านข้างและไม่ตัดบรรทัด */}
            <h1 className="m-0 mt-4 text-center text-[28px] leading-9 font-bold text-navy-900 min-[1280px]:-mx-12 min-[1280px]:text-[44px] min-[1280px]:leading-13 min-[1280px]:whitespace-nowrap short:text-[28px] short:leading-9">
              Recovery Password
            </h1>

            <div className="mt-6 flex flex-col gap-4 short:mt-4 short:gap-3">
              <TextField
                id="recovery-email"
                type="email"
                label="Email"
                autoComplete="username"
                placeholder="your.email@example.com"
                value={email}
                onChange={setEmail}
                error={errors.email}
              />
              <TextField
                id="recovery-code"
                label="Recovery Code"
                autoComplete="off"
                placeholder="Enter your recovery code"
                value={recoveryCode}
                onChange={(value) => setRecoveryCode(value.toUpperCase())}
                error={errors.recoveryCode}
              />
              <div className="grid grid-cols-1 gap-4 short:gap-3 min-[600px]:grid-cols-2">
                <PasswordField
                  id="recovery-new-password"
                  label="New-Password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={setNewPassword}
                  error={errors.newPassword}
                />
                <PasswordField
                  id="recovery-confirm-password"
                  label="Confirm New-Password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  error={errors.confirmPassword}
                />
              </div>
            </div>

            {errors.form && (
              <div role="alert" className="mt-4">
                <FieldError id="recovery-form-error">{errors.form}</FieldError>
              </div>
            )}

            <OnboardingButton type="submit" className="mt-4 w-full short:mt-3" disabled={submitting}>
              Reset Password
            </OnboardingButton>
          </form>
        </main>
      </div>

      <ResetPasswordSuccessModal open={successOpen} onClose={handleSuccessClose} />
    </div>
  )
}

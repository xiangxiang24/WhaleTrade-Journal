import { useCallback, useState, type FormEvent } from 'react'
import { RefreshCw } from 'lucide-react'
import AuthLayout from './components/auth-layout'
import { FieldError, PasswordField, TextField } from './components/auth-field'
import OnboardingButton from './components/onboarding-button'
import { EMAIL_PATTERN, MIN_PASSWORD_LENGTH } from './components/auth-validation'
import { usePageLeave } from './components/use-page-leave'
import RegisterSuccessModal from './modals/register-success-modal'
import type { RegisterData, RegisterErrors, RegisterResult } from './types/register'

type RegisterProps = {
  /** สร้างบัญชีกับ backend แล้วคืนรหัสกู้คืน: ถ้าไม่สำเร็จให้ throw Error พร้อมข้อความที่จะแสดง */
  onRegister?: (data: RegisterData) => Promise<RegisterResult>
  /** เรียกเมื่อ modal "Register Successful" ปิดแล้ว ให้ผู้เรียกพาไปหน้าถัดไป (Loading) */
  onSuccess?: () => void
  onBack?: () => void
  onSwitchToLogin?: () => void
}


// ชั่วคราว: รหัสตัวอย่างไว้ดู modal จนกว่าจะต่อ backend (backend เป็นผู้สร้างรหัสกู้คืนจริง)
const DEMO_RECOVERY_CODE = 'AHDB3309'

function validate(
  { fullName, displayName, email, password }: RegisterData,
  confirmPassword: string,
): RegisterErrors {
  const errors: RegisterErrors = {}
  if (!fullName) errors.fullName = 'Please enter your full name.'
  if (!displayName) errors.displayName = 'Please enter a display name.'
  if (!email) errors.email = 'Please enter your email.'
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'Please enter a valid email address.'
  if (!password) errors.password = 'Please enter a password.'
  else if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.'
  else if (password && confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

// หน้า Register: สมัครสมาชิกแล้วแสดง modal พร้อมรหัสกู้คืน (แสดงครั้งเดียว) กด OK แล้วไปหน้า Loading
export default function Register({ onRegister, onSuccess, onBack, onSwitchToLogin }: RegisterProps) {
  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState('')
  // Display name เริ่มต้นเท่ากับ Full name (database.md) จนกว่าผู้ใช้จะแก้เอง
  const [displayNameEdited, setDisplayNameEdited] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null)
  const { leaving, leaveTo } = usePageLeave()

  // modal ปิดแล้ว: เนื้อหาหน้าลอยออกก่อนไปหน้า Loading
  const handleSuccessClose = useCallback(() => {
    setRecoveryCode(null)
    leaveTo(onSuccess)
  }, [onSuccess, leaveTo])

  function handleFullNameChange(value: string) {
    setFullName(value)
    if (!displayNameEdited) setDisplayName(value)
  }

  function handleDisplayNameChange(value: string) {
    setDisplayName(value)
    setDisplayNameEdited(value !== '')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    const data = {
      fullName: fullName.trim(),
      displayName: displayName.trim(),
      email: email.trim(),
      password,
    }
    const found = validate(data, confirmPassword)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      const result = onRegister ? await onRegister(data) : { recoveryCode: DEMO_RECOVERY_CODE }
      setRecoveryCode(result.recoveryCode)
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Register failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome New Guest!"
      subtitle="Please Register to your Whale Trade Journal"
      leaving={leaving}
      onBack={() => leaveTo(onBack)}
      modal={
        <RegisterSuccessModal
          open={recoveryCode !== null}
          recoveryCode={recoveryCode ?? ''}
          onClose={handleSuccessClose}
        />
      }
    >
      <form noValidate onSubmit={handleSubmit} className="min-w-0 flex-1 p-8 short:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-pill bg-blue-50 px-4 py-1.5 text-[12px] leading-4 font-medium text-navy-700">
            State : Register
          </span>
          <button
            type="button"
            onClick={() => leaveTo(onSwitchToLogin)}
            className="inline-flex items-center gap-1.5 rounded-pill text-[12px] leading-4 font-medium text-blue-500 hover:text-navy-700"
          >
            <RefreshCw size={14} strokeWidth={1.75} aria-hidden="true" />
            Switch to Login
          </button>
        </div>

        <h2 className="m-0 mt-3 text-[22px] leading-7 font-bold text-navy-900">Register</h2>

        <div className="mt-3 flex flex-col gap-4 short:gap-3">
          <TextField
            id="register-full-name"
            label="Full Name"
            autoComplete="name"
            placeholder="Your full name"
            value={fullName}
            onChange={handleFullNameChange}
            error={errors.fullName}
          />
          <TextField
            id="register-display-name"
            label="Display Name"
            autoComplete="nickname"
            placeholder="How we’ll call you in the app"
            value={displayName}
            onChange={handleDisplayNameChange}
            error={errors.displayName}
          />
          <TextField
            id="register-email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={setEmail}
            error={errors.email}
          />
          <div className="grid grid-cols-1 gap-4 short:gap-3 min-[600px]:grid-cols-2">
            <PasswordField
              id="register-password"
              label="Password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              error={errors.password}
            />
            <PasswordField
              id="register-confirm-password"
              label="Confirm Password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
            />
          </div>
        </div>

        {errors.form && (
          <div role="alert" className="mt-4">
            <FieldError id="register-form-error">{errors.form}</FieldError>
          </div>
        )}

        <OnboardingButton type="submit" className="mt-4 short:mt-3 w-full" disabled={submitting}>
          Register
        </OnboardingButton>
      </form>
    </AuthLayout>
  )
}

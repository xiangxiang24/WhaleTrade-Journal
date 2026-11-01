import { useCallback, useState, type FormEvent } from 'react'
import { RefreshCw } from 'lucide-react'
import AuthLayout from './components/auth-layout'
import { FieldError, PasswordField, TextField } from './components/auth-field'
import OnboardingButton from './components/onboarding-button'
import { usePageLeave } from './components/use-page-leave'
import LoginSuccessModal from './modals/login-success-modal'
import type { LoginCredentials, LoginErrors } from './types/login'

type LoginProps = {
  /** ตรวจบัญชีกับ backend: ถ้าไม่สำเร็จให้ throw Error พร้อมข้อความที่จะแสดง (ถ้าไม่ส่งมา ถือว่าสำเร็จเมื่อกรอกครบ) */
  onLogin?: (credentials: LoginCredentials) => Promise<void>
  /** เรียกเมื่อ modal "Login Successful" ปิดแล้ว ให้ผู้เรียกพาไปหน้าถัดไป */
  onSuccess?: () => void
  onBack?: () => void
  onSwitchToRegister?: () => void
  onForgotPassword?: () => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate({ email, password }: LoginCredentials): LoginErrors {
  const errors: LoginErrors = {}
  if (!email.trim()) errors.email = 'Please enter your email.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Please enter a valid email address.'
  if (!password) errors.password = 'Please enter your password.'
  return errors
}

// หน้า Login: ฟอร์ม Email / Password, สำเร็จแล้วแสดง modal ค้างไว้ ~2 วินาที
export default function Login({
  onLogin,
  onSuccess,
  onBack,
  onSwitchToRegister,
  onForgotPassword,
}: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const { leaving, leaveTo } = usePageLeave()

  const handleSuccessClose = useCallback(() => {
    setSuccessOpen(false)
    onSuccess?.()
  }, [onSuccess])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    const credentials = { email: email.trim(), password }
    const found = validate(credentials)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await onLogin?.(credentials)
      setSuccessOpen(true)
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Login failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Please Login to your Whale Trade Journal"
      leaving={leaving}
      onBack={() => leaveTo(onBack)}
      modal={<LoginSuccessModal open={successOpen} onClose={handleSuccessClose} />}
    >
      <form noValidate onSubmit={handleSubmit} className="min-w-0 flex-1 p-8 short:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-pill bg-blue-50 px-4 py-1.5 text-[12px] leading-4 font-medium text-navy-700">
            State : Login
          </span>
          <button
            type="button"
            onClick={() => leaveTo(onSwitchToRegister)}
            className="inline-flex items-center gap-1.5 rounded-pill text-[12px] leading-4 font-medium text-blue-500 hover:text-navy-700"
          >
            <RefreshCw size={14} strokeWidth={1.75} aria-hidden="true" />
            Switch to Register
          </button>
        </div>

        <h2 className="m-0 mt-6 text-[22px] leading-7 font-bold text-navy-900">Login</h2>

        <div className="mt-4 flex flex-col gap-4 short:gap-3">
          <TextField
            id="login-email"
            type="email"
            label="Email"
            autoComplete="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={setEmail}
            error={errors.email}
          />
          <PasswordField
            id="login-password"
            label="Password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            labelAction={
              <button
                type="button"
                onClick={() => leaveTo(onForgotPassword)}
                className="rounded-pill text-[12px] leading-4 font-medium text-blue-500 hover:text-navy-700 hover:underline"
              >
                Forgot Password?
              </button>
            }
          />
        </div>

        {errors.form && (
          <div role="alert" className="mt-4">
            <FieldError id="login-form-error">{errors.form}</FieldError>
          </div>
        )}

        <OnboardingButton type="submit" className="mt-4 w-full" disabled={submitting}>
          Login
        </OnboardingButton>
      </form>
    </AuthLayout>
  )
}

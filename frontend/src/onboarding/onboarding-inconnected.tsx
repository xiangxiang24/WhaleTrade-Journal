import { LogIn, UserPlus } from 'lucide-react'
import OnboardingButton from './components/onboarding-button'
import OnboardingShell from './components/onboarding-shell'
import { usePageLeave } from '../shared/hooks/use-page-leave'

type OnboardingInconnectedProps = {
  onLogin?: () => void
  onRegister?: () => void
  /** สลับไปหน้า "มีบัญชีเชื่อมต่อแล้ว" */
  onSwitch?: () => void
}

// Onboarding สถานะยังไม่เคยเชื่อมต่อบัญชี: ให้เลือก Login หรือ Register
export default function OnboardingInconnected({
  onLogin,
  onRegister,
  onSwitch,
}: OnboardingInconnectedProps) {
  const { leaving, leaveTo } = usePageLeave()

  return (
    <OnboardingShell
      leaving={leaving}
      switchLabel="Switch to Authentication"
      onSwitch={() => leaveTo(onSwitch)}
    >
      <div className="flex flex-wrap justify-center gap-7">
        <OnboardingButton className="min-w-54" onClick={() => leaveTo(onLogin)}>
          Login
          <LogIn size={22} strokeWidth={1.75} aria-hidden="true" />
        </OnboardingButton>
        <OnboardingButton variant="secondary" className="min-w-54" onClick={() => leaveTo(onRegister)}>
          Register
          <UserPlus size={22} strokeWidth={1.75} aria-hidden="true" />
        </OnboardingButton>
      </div>
    </OnboardingShell>
  )
}

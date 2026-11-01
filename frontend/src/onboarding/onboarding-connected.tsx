import { useState } from 'react'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import OnboardingButton from './components/onboarding-button'
import OnboardingShell from './components/onboarding-shell'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import type { ConnectedAccount } from './types/connected-account'

type OnboardingConnectedProps = {
  account: ConnectedAccount
  onStart?: () => void
  /** สลับกลับไปหน้า Login / Register */
  onSwitch?: () => void
}

// ป้ายใต้ชื่อเป็นข้อความคงที่ของหน้าจอ (database.md หัวข้อ 4)
const ACCOUNT_LABEL = 'Dividend Haven'

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0]?.toUpperCase() ?? '')
    .join('')
}

// Onboarding สถานะมีบัญชีเชื่อมต่อไว้แล้ว: เลือกบัญชีแล้วกดเริ่มใช้งานโดยไม่ต้องกรอกรหัสผ่านซ้ำ
export default function OnboardingConnected({
  account,
  onStart,
  onSwitch,
}: OnboardingConnectedProps) {
  const [selected, setSelected] = useState(true)
  const { leaving, leaveTo } = usePageLeave()

  return (
    <OnboardingShell
      leaving={leaving}
      switchLabel="Switch to Login/Register"
      onSwitch={() => leaveTo(onSwitch)}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => setSelected((value) => !value)}
        className={`flex max-w-full items-center gap-2.5 rounded-pill border bg-surface py-1.5 pr-3 pl-3.5 text-left transition-colors duration-150 ${
          selected ? 'border-blue-500' : 'border-blue-200 hover:border-blue-500'
        }`}
      >
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-blue-500 text-[10px] leading-4 font-semibold text-surface"
        >
          {getInitials(account.displayName)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12px] leading-4 font-semibold text-navy-900">
            {account.displayName} · {ACCOUNT_LABEL}
          </span>
          <span className="flex items-center gap-1 text-[10px] leading-4 font-medium text-navy-700">
            <span aria-hidden="true" className="size-1.5 rounded-pill bg-navy-700" />
            Connected
          </span>
        </span>
        <ShieldCheck
          size={12}
          strokeWidth={1.75}
          className="ml-1 shrink-0 text-navy-700"
          aria-hidden="true"
        />
      </button>

      <OnboardingButton className="mt-6 min-w-83" disabled={!selected} onClick={() => leaveTo(onStart)}>
        Start your Journal
        <ChevronRight size={24} strokeWidth={2} aria-hidden="true" />
      </OnboardingButton>
    </OnboardingShell>
  )
}

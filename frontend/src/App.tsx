import { useState } from 'react'
import OpeningPage from './onboarding/opening-page'
import OnboardingInconnected from './onboarding/onboarding-inconnected'
import OnboardingConnected from './onboarding/onboarding-connected'
import Login from './onboarding/login'
import Register from './onboarding/register'
import Loading from './onboarding/loading'
import RecoveryPassword from './onboarding/recovery-password'
import MyJournal from './my-journal/my-journal'
import Journaling from './journaling/journaling'
import PortfolioPage from './portfolio/portfolio'
import TransactionLogs from './transaction-logs/transaction-logs'
import ReminderPage from './reminder/reminder'
import TargetAmount from './target-amount/target-amount'
import SavedPlan from './saved-plan/saved-plan'
import PlanDetail from './saved-plan/plan-detail'
import SettingPage from './setting-page/setting-page'
import { getAccount } from './shared/data/account'
import type { Account } from './shared/types/account'
import { countDueReminders } from './shared/data/reminders'
import type { SidebarKey } from './shared/types/sidebar'
import type { LoginCredentials } from './onboarding/types/login'

type Screen = 'opening' | 'inconnected' | 'connected' | 'login' | 'register' | 'loading' | 'recovery' | 'journals' | 'journaling' | 'portfolio' | 'transaction-logs' | 'reminder' | 'target-amount' | 'saved-plan' | 'plan-detail' | 'setting'

// ชั่วคราว (ลบทิ้งเมื่อต่อ backend): บัญชีจำลองไว้ทดสอบ Login → modal → Loading → My Journals
const MOCK_EMAIL = 'demo@whaletrade.app'
const MOCK_PASSWORD = 'Whale1234'

async function mockLogin({ email, password }: LoginCredentials) {
  await new Promise((resolve) => setTimeout(resolve, 600))
  if (email.toLowerCase() !== MOCK_EMAIL || password !== MOCK_PASSWORD) {
    throw new Error('Incorrect email or password.')
  }
}

// เมนู Sidebar ที่มีหน้าแล้ว (เมนูอื่นยังไม่ทำ จึงไม่เปลี่ยนหน้า)
function screenForMenu(key: SidebarKey): Screen | null {
  if (key === 'my-journals') return 'journals'
  if (key === 'portfolio') return 'portfolio'
  if (key === 'reminder') return 'reminder'
  if (key === 'target-amount') return 'target-amount'
  if (key === 'saved-plan') return 'saved-plan'
  if (key === 'setting') return 'setting'
  return null
}

function App() {
  const [screen, setScreen] = useState<Screen>('opening')
  const [openNoteId, setOpenNoteId] = useState<number | null>(null)
  const [openPortfolioId, setOpenPortfolioId] = useState<number | null>(null)
  const [openPlanId, setOpenPlanId] = useState<number | null>(null)
  // บัญชีที่ล็อกอินอยู่ (ชื่อ รูป เขตเวลา) หน้า Setting แก้แล้วทุกหน้าเห็นทันที
  const [account, setAccount] = useState<Account>(() => getAccount())
  const sidebarUser = { displayName: account.displayName, avatarUrl: account.avatarUrl ?? undefined }
  const timeZone = account.timezone

  if (screen === 'opening') {
    return <OpeningPage onFinish={() => setScreen('inconnected')} />
  }
  if (screen === 'inconnected') {
    return (
      <OnboardingInconnected
        onLogin={() => setScreen('login')}
        onRegister={() => setScreen('register')}
        onSwitch={() => setScreen('connected')}
      />
    )
  }
  if (screen === 'login') {
    return (
      <Login
        onLogin={mockLogin}
        onBack={() => setScreen('inconnected')}
        onSwitchToRegister={() => setScreen('register')}
        onForgotPassword={() => setScreen('recovery')}
        onSuccess={() => setScreen('loading')}
      />
    )
  }
  if (screen === 'register') {
    return (
      <Register
        onBack={() => setScreen('inconnected')}
        onSwitchToLogin={() => setScreen('login')}
        onSuccess={() => setScreen('loading')}
      />
    )
  }
  if (screen === 'recovery') {
    return (
      <RecoveryPassword
        onBack={() => setScreen('inconnected')}
        onSuccess={() => setScreen('login')}
      />
    )
  }
  if (screen === 'journals') {
    return (
      <MyJournal
        user={sidebarUser}
        timeZone={timeZone}
        reminderBadge={countDueReminders()}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'journals')}
        onLogout={() => setScreen('inconnected')}
        onOpenNote={(id) => {
          setOpenNoteId(id)
          setScreen('journaling')
        }}
      />
    )
  }
  if (screen === 'portfolio') {
    return (
      <PortfolioPage
        user={sidebarUser}
        timeZone={timeZone}
        reminderBadge={countDueReminders()}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'portfolio')}
        onLogout={() => setScreen('inconnected')}
        onOpenPortfolio={(id) => {
          setOpenPortfolioId(id)
          setScreen('transaction-logs')
        }}
      />
    )
  }
  if (screen === 'setting') {
    return (
      <SettingPage
        user={sidebarUser}
        reminderBadge={countDueReminders()}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'setting')}
        onLogout={() => setScreen('inconnected')}
        onAccountChange={setAccount}
        onAccountDeleted={() => setScreen('opening')}
      />
    )
  }
  if (screen === 'saved-plan') {
    return (
      <SavedPlan
        user={sidebarUser}
        timeZone={timeZone}
        reminderBadge={countDueReminders()}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'saved-plan')}
        onLogout={() => setScreen('inconnected')}
        onOpenPlan={(id) => {
          setOpenPlanId(id)
          setScreen('plan-detail')
        }}
      />
    )
  }
  if (screen === 'plan-detail' && openPlanId !== null) {
    return (
      <PlanDetail
        planId={openPlanId}
        user={sidebarUser}
        timeZone={timeZone}
        reminderBadge={countDueReminders()}
        onBack={() => setScreen('saved-plan')}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'plan-detail')}
        onLogout={() => setScreen('inconnected')}
      />
    )
  }
  if (screen === 'target-amount') {
    return (
      <TargetAmount
        user={sidebarUser}
        reminderBadge={countDueReminders()}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'target-amount')}
        onLogout={() => setScreen('inconnected')}
      />
    )
  }
  if (screen === 'reminder') {
    return (
      <ReminderPage
        user={sidebarUser}
        timeZone={timeZone}
        reminderBadge={countDueReminders()}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'reminder')}
        onLogout={() => setScreen('inconnected')}
      />
    )
  }
  if (screen === 'transaction-logs' && openPortfolioId !== null) {
    return (
      <TransactionLogs
        portfolioId={openPortfolioId}
        user={sidebarUser}
        reminderBadge={countDueReminders()}
        onBack={() => setScreen('portfolio')}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'transaction-logs')}
        onLogout={() => setScreen('inconnected')}
      />
    )
  }
  if (screen === 'journaling' && openNoteId !== null) {
    return (
      <Journaling
        noteId={openNoteId}
        user={sidebarUser}
        reminderBadge={countDueReminders()}
        onLogout={() => setScreen('inconnected')}
        onBack={() => setScreen('journals')}
        onDeleted={() => setScreen('journals')}
      />
    )
  }
  if (screen === 'loading') {
    // จบแล้วเข้าหน้าแรกของแอป (My Journals)
    return <Loading onFinish={() => setScreen('journals')} />
  }
  return (
    <OnboardingConnected
      account={{ displayName: account.displayName }}
      onStart={() => setScreen('journals')}
      onSwitch={() => setScreen('inconnected')}
    />
  )
}

export default App

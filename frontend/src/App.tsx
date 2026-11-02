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
import type { SidebarKey } from './shared/types/sidebar'
import type { LoginCredentials } from './onboarding/types/login'

type Screen = 'opening' | 'inconnected' | 'connected' | 'login' | 'register' | 'loading' | 'recovery' | 'journals' | 'journaling' | 'portfolio'

// ชั่วคราว: ข้อมูลตัวอย่างไว้ดูหน้า Onboarding จนกว่าจะมี router และระบบ auth จริง
const SAMPLE_ACCOUNT = { displayName: 'Thomas W.' }

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
  return null
}

function App() {
  const [screen, setScreen] = useState<Screen>('opening')
  const [openNoteId, setOpenNoteId] = useState<number | null>(null)

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
        user={SAMPLE_ACCOUNT}
        reminderBadge={2}
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
        user={SAMPLE_ACCOUNT}
        reminderBadge={2}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'portfolio')}
        onLogout={() => setScreen('inconnected')}
      />
    )
  }
  if (screen === 'journaling' && openNoteId !== null) {
    return (
      <Journaling
        noteId={openNoteId}
        user={SAMPLE_ACCOUNT}
        reminderBadge={2}
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
      account={SAMPLE_ACCOUNT}
      onStart={() => setScreen('journals')}
      onSwitch={() => setScreen('inconnected')}
    />
  )
}

export default App

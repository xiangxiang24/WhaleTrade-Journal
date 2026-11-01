import { useState } from 'react'
import OpeningPage from './onboarding/opening-page'
import OnboardingInconnected from './onboarding/onboarding-inconnected'
import OnboardingConnected from './onboarding/onboarding-connected'
import Login from './onboarding/login'
import Register from './onboarding/register'

type Screen = 'opening' | 'inconnected' | 'connected' | 'login' | 'register'

// ชั่วคราว: ข้อมูลตัวอย่างไว้ดูหน้า Onboarding จนกว่าจะมี router และระบบ auth จริง
const SAMPLE_ACCOUNT = { displayName: 'Thomas W.' }

function App() {
  const [screen, setScreen] = useState<Screen>('opening')

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
        onBack={() => setScreen('inconnected')}
        onSwitchToRegister={() => setScreen('register')}
        onSuccess={() => setScreen('connected')}
      />
    )
  }
  if (screen === 'register') {
    return (
      <Register
        onBack={() => setScreen('inconnected')}
        onSwitchToLogin={() => setScreen('login')}
        onSuccess={() => setScreen('login')}
      />
    )
  }
  return <OnboardingConnected account={SAMPLE_ACCOUNT} onSwitch={() => setScreen('inconnected')} />
}

export default App

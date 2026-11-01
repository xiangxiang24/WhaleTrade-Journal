import { useState } from 'react'
import OpeningPage from './onboarding/opening-page'
import OnboardingInconnected from './onboarding/onboarding-inconnected'
import OnboardingConnected from './onboarding/onboarding-connected'

type Screen = 'opening' | 'inconnected' | 'connected'

// ชั่วคราว: ข้อมูลตัวอย่างไว้ดูหน้า Onboarding จนกว่าจะมี router และระบบ auth จริง
const SAMPLE_ACCOUNT = { displayName: 'Thomas W.' }

function App() {
  const [screen, setScreen] = useState<Screen>('opening')

  if (screen === 'opening') {
    return <OpeningPage onFinish={() => setScreen('inconnected')} />
  }
  if (screen === 'inconnected') {
    return <OnboardingInconnected onSwitch={() => setScreen('connected')} />
  }
  return <OnboardingConnected account={SAMPLE_ACCOUNT} onSwitch={() => setScreen('inconnected')} />
}

export default App

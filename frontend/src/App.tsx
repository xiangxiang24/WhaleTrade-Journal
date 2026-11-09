import { useEffect, useState } from 'react'
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
import TrashPage from './trash/trash-page'
import { loadAssets } from './shared/data/assets'
import { getToken } from './shared/apis/client'
import { fetchMe, loginAccount, logoutAccount, recoverPassword, registerAccount } from './onboarding/apis/onboarding'
import { countDueReminders } from './reminder/apis/reminder'
import I18nProvider from './shared/i18n/i18n-provider'
import type { Account } from './shared/types/account'
import type { SidebarKey } from './shared/types/sidebar'

type Screen = 'opening' | 'inconnected' | 'connected' | 'login' | 'register' | 'loading' | 'recovery' | 'journals' | 'journaling' | 'portfolio' | 'transaction-logs' | 'reminder' | 'target-amount' | 'saved-plan' | 'plan-detail' | 'setting' | 'trash'

// ภาษาล่าสุดจำไว้ในเครื่อง เพื่อให้หน้าก่อนล็อกอินใช้ภาษาเดิม (ค่าจริงอยู่ที่ User.language ใน backend)
const LANGUAGE_KEY = 'whale-journal:language'

function rememberedLanguage(): Account['language'] {
  try {
    return localStorage.getItem(LANGUAGE_KEY) === 'th' ? 'th' : 'en'
  } catch {
    return 'en'
  }
}

// ค่าแทนตอนยังไม่ล็อกอิน (หน้าที่ต้องใช้บัญชีจะไม่แสดงก่อนล็อกอิน)
const GUEST: Account = { fullName: '', displayName: '', email: '', avatarUrl: null, language: 'en', timezone: 'Asia/Bangkok' }

// เมนู Sidebar ที่มีหน้าแล้ว (เมนูอื่นยังไม่ทำ จึงไม่เปลี่ยนหน้า)
function screenForMenu(key: SidebarKey): Screen | null {
  if (key === 'my-journals') return 'journals'
  if (key === 'portfolio') return 'portfolio'
  if (key === 'reminder') return 'reminder'
  if (key === 'target-amount') return 'target-amount'
  if (key === 'saved-plan') return 'saved-plan'
  if (key === 'setting') return 'setting'
  if (key === 'trash') return 'trash'
  return null
}

type ScreensProps = {
  /** null = ยังไม่ได้ล็อกอิน */
  session: Account | null
  setAccount: (account: Account | null) => void
}

function Screens({ session, setAccount }: ScreensProps) {
  const account = session ?? GUEST
  const [screen, setScreen] = useState<Screen>('opening')
  // จำนวนการเตือนที่ถึงเวลาแล้ว (badge ที่ Sidebar) อัปเดตทุกครั้งที่เปลี่ยนหน้าและทุกนาที
  const [due, setDue] = useState(0)

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const refresh = () =>
      countDueReminders()
        .then((count) => {
          if (!cancelled) setDue(count)
        })
        .catch(() => {})
    void refresh()
    const timer = setInterval(refresh, 60_000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [screen, session])

  // เข้าสู่ระบบสำเร็จ: เก็บบัญชี + โหลดรายการหุ้นให้ทุกหน้าใช้
  async function enter(next: Account) {
    await loadAssets()
    setAccount(next)
  }

  function logout() {
    logoutAccount()
    setAccount(null)
    setScreen('inconnected')
  }

  const [openNoteId, setOpenNoteId] = useState<number | null>(null)
  const [openPortfolioId, setOpenPortfolioId] = useState<number | null>(null)
  const [openPlanId, setOpenPlanId] = useState<number | null>(null)
  const sidebarUser = { displayName: account.displayName, avatarUrl: account.avatarUrl ?? undefined }
  const timeZone = account.timezone

  // หน้าที่ต้องล็อกอิน: ไม่มีบัญชี (ออกจากระบบ/ลบบัญชี/token ใช้ไม่ได้) = กลับหน้าเลือก Login/Register
  const needsAccount = !['opening', 'inconnected', 'login', 'register', 'loading', 'recovery'].includes(screen)
  if (needsAccount && !session) {
    return <OnboardingInconnected onLogin={() => setScreen('login')} onRegister={() => setScreen('register')} />
  }

  if (screen === 'opening') {
    return <OpeningPage onFinish={() => setScreen(session ? 'connected' : 'inconnected')} />
  }
  if (screen === 'inconnected') {
    return (
      <OnboardingInconnected
        onLogin={() => setScreen('login')}
        onRegister={() => setScreen('register')}
      />
    )
  }
  if (screen === 'login') {
    return (
      <Login
        onLogin={async (credentials) => enter(await loginAccount(credentials))}
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
        onRegister={async (data) => {
          const { recoveryCode, account: created } = await registerAccount(data)
          await enter(created)
          return { recoveryCode }
        }}
        onBack={() => setScreen('inconnected')}
        onSwitchToLogin={() => setScreen('login')}
        onSuccess={() => setScreen('loading')}
      />
    )
  }
  if (screen === 'recovery') {
    return (
      <RecoveryPassword
        onResetPassword={recoverPassword}
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
        reminderBadge={due}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'journals')}
        onLogout={logout}
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
        reminderBadge={due}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'portfolio')}
        onLogout={logout}
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
        reminderBadge={due}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'setting')}
        onLogout={logout}
        onAccountChange={setAccount}
        onAccountDeleted={() => {
          setAccount(null)
          setScreen('opening')
        }}
      />
    )
  }
  if (screen === 'trash') {
    return (
      <TrashPage
        user={sidebarUser}
        timeZone={timeZone}
        reminderBadge={due}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'trash')}
        onLogout={logout}
      />
    )
  }
  if (screen === 'saved-plan') {
    return (
      <SavedPlan
        user={sidebarUser}
        timeZone={timeZone}
        reminderBadge={due}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'saved-plan')}
        onLogout={logout}
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
        reminderBadge={due}
        onBack={() => setScreen('saved-plan')}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'plan-detail')}
        onLogout={logout}
      />
    )
  }
  if (screen === 'target-amount') {
    return (
      <TargetAmount
        user={sidebarUser}
        reminderBadge={due}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'target-amount')}
        onLogout={logout}
      />
    )
  }
  if (screen === 'reminder') {
    return (
      <ReminderPage
        user={sidebarUser}
        timeZone={timeZone}
        reminderBadge={due}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'reminder')}
        onLogout={logout}
      />
    )
  }
  if (screen === 'transaction-logs' && openPortfolioId !== null) {
    return (
      <TransactionLogs
        portfolioId={openPortfolioId}
        user={sidebarUser}
        reminderBadge={due}
        onBack={() => setScreen('portfolio')}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'transaction-logs')}
        onLogout={logout}
      />
    )
  }
  if (screen === 'journaling' && openNoteId !== null) {
    return (
      <Journaling
        noteId={openNoteId}
        user={sidebarUser}
        reminderBadge={due}
        onNavigate={(key) => setScreen(screenForMenu(key) ?? 'journaling')}
        onLogout={logout}
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
      onSwitch={logout}
    />
  )
}

// บัญชีที่ล็อกอินอยู่ (ชื่อ รูป เขตเวลา ภาษา) หน้า Setting แก้แล้วทุกหน้าเห็นทันที
// เปิดแอปแล้วมี token เดิม = ตรวจกับ backend ก่อน ถ้ายังใช้ได้จะข้ามหน้า Login (ไปหน้า "ยินดีต้อนรับกลับ")
function App() {
  const [account, setAccountState] = useState<Account | null>(null)
  const [booting, setBooting] = useState(() => getToken() !== null)
  const [language, setLanguage] = useState<Account['language']>(rememberedLanguage)

  function setAccount(next: Account | null) {
    setAccountState(next)
    if (!next) return
    setLanguage(next.language)
    try {
      localStorage.setItem(LANGUAGE_KEY, next.language)
    } catch {
      // จำภาษาไม่ได้ (storage ปิด): ใช้ค่าจาก backend ทุกครั้งที่ล็อกอินอยู่แล้ว
    }
  }

  useEffect(() => {
    if (!booting) return
    let cancelled = false
    ;(async () => {
      try {
        const me = await fetchMe()
        await loadAssets()
        if (!cancelled) setAccount(me)
      } catch {
        // token หมดอายุ/ใช้ไม่ได้ หรือ backend ยังไม่พร้อม: ไปหน้า Login ตามปกติ
      }
      if (!cancelled) setBooting(false)
    })()
    return () => {
      cancelled = true
    }
  }, [booting])

  return (
    <I18nProvider language={language}>{booting ? null : <Screens session={account} setAccount={setAccount} />}</I18nProvider>
  )
}

export default App

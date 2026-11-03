import { useCallback, useState } from 'react'
import banner from '../assets/Banner.png'
import AppLayout from '../shared/app-shell/app-layout'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import type { Account } from '../shared/types/account'
import type { SidebarKey, SidebarUser } from '../shared/types/sidebar'
import PortfolioToastView from '../portfolio/components/portfolio-toast'
import AccountSection from './components/account-section'
import LanguageSection from './components/language-section'
import SecuritySection from './components/security-section'
import SettingHeader from './components/setting-header'
import ChangeEmailModal from './modals/change-email-modal'
import ChangePasswordModal from './modals/change-password-modal'
import DeleteAccountModal from './modals/delete-account-modal'
import type { SettingToast } from './types/setting'
import { useAccount } from './types/use-account'

type SettingPageProps = {
  user: SidebarUser
  /** จำนวน Reminder ที่ถึงเวลาแล้ว (badge ที่ Sidebar) */
  reminderBadge?: number
  onNavigate?: (key: SidebarKey) => void
  onLogout?: () => void
  /** บัญชีเปลี่ยน (ชื่อ รูป อีเมล ภาษา เขตเวลา) ให้ App อัปเดต Sidebar / TopBar / เขตเวลาทั้งแอป */
  onAccountChange?: (account: Account) => void
  /** ลบบัญชีสำเร็จ → กลับหน้าแรกของแอป */
  onAccountDeleted?: () => void
}

// หน้า Setting (หน้าเดียว 3 section): Account / Language & Display / Account Security
export default function SettingPage({
  user,
  reminderBadge,
  onNavigate,
  onLogout,
  onAccountChange,
  onAccountDeleted,
}: SettingPageProps) {
  const state = useAccount(useCallback((account: Account) => onAccountChange?.(account), [onAccountChange]))
  const { leaving, leaveTo } = usePageLeave()
  const [emailOpen, setEmailOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toast, setToast] = useState<SettingToast | null>(null)

  const showToast = useCallback((message: string) => setToast({ id: Date.now(), message }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  return (
    <AppLayout
      active="setting"
      user={user}
      reminderBadge={reminderBadge}
      onNavigate={(key) => {
        if (key !== 'setting') leaveTo(() => onNavigate?.(key))
      }}
      onLogout={() => onLogout?.()}
    >
      <>
        <div className={`pt-2 pb-6 ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
          <div className="animate-fade-up motion-reduce:animate-none">
            <SettingHeader />
          </div>

          {state.status === 'loading' && (
            <div role="status" aria-label="Loading your settings" className="mt-6 flex flex-col gap-5">
              {[0, 1, 2].map((index) => (
                <div key={index} className="h-60 animate-pulse rounded-4xl bg-blue-100 motion-reduce:animate-none" />
              ))}
            </div>
          )}

          {state.status === 'error' && (
            <div className="mt-6 flex flex-col items-center rounded-4xl bg-surface px-6 py-12 text-center shadow-md">
              <img className="h-36 w-auto min-[640px]:h-44" src={banner} alt="" />
              <p className="m-0 mt-4 text-[18px] leading-7 font-bold text-navy-900">Could not load your settings</p>
              <p className="m-0 mt-1 text-[14px] leading-6 text-text-muted">Something went wrong. Please try again.</p>
              <button
                type="button"
                onClick={state.reload}
                className="mt-6 inline-flex h-11 items-center rounded-pill bg-blue-500 px-6 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900"
              >
                Try again
              </button>
            </div>
          )}

          {state.status === 'ready' && state.account && (
            <div className="mt-6 flex animate-fade-up flex-col gap-5 px-1 [animation-delay:80ms] min-[1280px]:gap-6 motion-reduce:animate-none">
              <AccountSection
                state={state}
                onEditEmail={() => setEmailOpen(true)}
                onLogout={() => onLogout?.()}
                onSaved={() => showToast('Profile saved')}
              />
              <LanguageSection state={state} onSaved={() => showToast('Preferences saved')} />
              <SecuritySection onChangePassword={() => setPasswordOpen(true)} onDelete={() => setDeleteOpen(true)} />
            </div>
          )}
        </div>

        {/* modal และ toast อยู่นอก wrapper ที่มี transform เพื่อให้ position: fixed อ้างอิงทั้งหน้าต่าง */}
        <ChangeEmailModal
          open={emailOpen}
          currentEmail={state.account?.email ?? ''}
          onSubmit={async (email, password) => {
            await state.saveEmail(email, password)
            showToast('Email updated')
          }}
          onClose={() => setEmailOpen(false)}
        />
        <ChangePasswordModal
          open={passwordOpen}
          onSubmit={async (current, next) => {
            await state.changePassword(current, next)
            showToast('Password updated')
          }}
          onClose={() => setPasswordOpen(false)}
        />
        <DeleteAccountModal
          open={deleteOpen}
          onConfirm={async () => {
            await state.deleteAccount()
            onAccountDeleted?.()
          }}
          onClose={() => setDeleteOpen(false)}
        />
        <PortfolioToastView toast={toast} onUndo={() => undefined} onDismiss={dismissToast} />
      </>
    </AppLayout>
  )
}

import { useCallback, useState } from 'react'
import AppLayout from '../shared/app-shell/app-layout'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import type { Portfolio, PortfolioFormValues } from '../shared/types/portfolio'
import type { SidebarKey, SidebarUser } from '../shared/types/sidebar'
import PortfolioGrid from './components/portfolio-grid'
import PortfolioHeader from './components/portfolio-header'
import PortfolioToastView from './components/portfolio-toast'
import QuoteBanner from './components/quote-banner'
import PortfolioFormModal from './modals/portfolio-form-modal'
import TrashPortfolioModal from './modals/trash-portfolio-modal'
import type { PortfolioToast } from './types/portfolio'
import { usePortfolios } from './types/use-portfolios'
import { useI18n } from '../shared/i18n/use-i18n'

type PortfolioPageProps = {
  user: SidebarUser
  /** จำนวน Reminder ที่ถึงเวลาแล้ว (badge ที่ Sidebar) */
  reminderBadge?: number
  /** เขตเวลาของผู้ใช้ (รหัส IANA จาก User.timezone) ใช้แปลงวันที่ Last updated */
  timeZone?: string
  onNavigate?: (key: SidebarKey) => void
  onLogout?: () => void
  /** เปิดหน้ารายละเอียดพอร์ต (Goal Card + Summary + Port Log) ยังไม่มีหน้านี้จึงไม่ถูกส่งมาจาก App */
  onOpenPortfolio?: (id: number) => void
}

// หน้า Portfolio: ส่วนหัว + การ์ดพอร์ตทั้งหมด (สร้าง/แก้/ย้ายไปถังขยะ/Undo) + แถบข้อคิดท้ายหน้า
export default function PortfolioPage({
  user,
  reminderBadge,
  timeZone = 'Asia/Bangkok',
  onNavigate,
  onLogout,
  onOpenPortfolio,
}: PortfolioPageProps) {
  const { t } = useI18n()
  const { portfolios, status, reload, create, update, trash, restore } = usePortfolios()
  const [previewEmpty, setPreviewEmpty] = useState(false)
  // form = null ปิด, { portfolio: null } = สร้างใหม่, { portfolio } = แก้พอร์ตเดิม
  const [form, setForm] = useState<{ portfolio: Portfolio | null } | null>(null)
  const [trashTarget, setTrashTarget] = useState<Portfolio | null>(null)
  const [toast, setToast] = useState<PortfolioToast | null>(null)
  const { leaving, leaveTo } = usePageLeave()

  const showToast = useCallback((next: Omit<PortfolioToast, 'id'>) => {
    setToast({ ...next, id: Date.now() })
  }, [])
  const dismissToast = useCallback(() => setToast(null), [])

  async function handleSubmit(values: PortfolioFormValues) {
    const editing = form?.portfolio
    if (editing) {
      await update(editing.id, values)
      showToast({ message: t('Saved changes to “{name}”', { name: values.name }) })
    } else {
      await create(values)
      setPreviewEmpty(false)
      showToast({ message: t('“{name}” is ready to grow', { name: values.name }) })
    }
  }

  async function handleTrash(portfolio: Portfolio) {
    await trash(portfolio.id)
    showToast({ message: t('“{name}” moved to Trash', { name: portfolio.name }), undoId: portfolio.id })
  }

  async function handleUndo(id: number) {
    setToast(null)
    try {
      await restore(id)
    } catch {
      showToast({ message: t('Could not restore this portfolio. Try the Trash page.') })
    }
  }

  return (
    <AppLayout
      active="portfolio"
      user={user}
      reminderBadge={reminderBadge}
      onNavigate={(key) => {
        if (key !== 'portfolio') leaveTo(() => onNavigate?.(key))
      }}
      onLogout={() => onLogout?.()}
    >
      <>
        {/* เนื้อหาเข้าด้วยการลอยขึ้นทีละส่วน ออกด้วยการลอยขึ้นและจางหาย (Sidebar/TopBar อยู่นิ่ง) */}
        <div className={`pt-2 pb-6 ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
          <div className="animate-fade-up motion-reduce:animate-none">
            <PortfolioHeader
              count={status === 'ready' ? portfolios.length : null}
              previewEmpty={previewEmpty}
              onTogglePreview={() => setPreviewEmpty((current) => !current)}
              onOpenTrash={() => leaveTo(() => onNavigate?.('trash'))}
              onCreate={() => setForm({ portfolio: null })}
            />
          </div>

          {/* pb-6 / px-1: เผื่อที่ให้เงาและการ์ดที่ลอยขึ้นตอน hover ไม่โดนพื้นที่เลื่อนตัด */}
          <section
            aria-label={t('Portfolios')}
            className="mt-6 animate-fade-up px-1 pb-2 [animation-delay:80ms] min-[640px]:mt-8 motion-reduce:animate-none"
          >
            <PortfolioGrid
              status={status}
              portfolios={portfolios}
              previewEmpty={previewEmpty}
              timeZone={timeZone}
              onOpen={(id) => leaveTo(onOpenPortfolio && (() => onOpenPortfolio(id)))}
              onEdit={(portfolio) => setForm({ portfolio })}
              onTrash={setTrashTarget}
              onCreate={() => setForm({ portfolio: null })}
              onRetry={reload}
            />
          </section>

          <div className="mt-8 animate-fade-up px-1 [animation-delay:160ms] min-[640px]:mt-10 motion-reduce:animate-none">
            <QuoteBanner />
          </div>
        </div>

        {/* modal และ toast อยู่นอก wrapper ที่มี transform เพื่อให้ position: fixed อ้างอิงทั้งหน้าต่าง */}
        <PortfolioFormModal
          open={form !== null}
          portfolio={form?.portfolio}
          onSubmit={handleSubmit}
          onClose={() => setForm(null)}
        />
        <TrashPortfolioModal portfolio={trashTarget} onConfirm={handleTrash} onClose={() => setTrashTarget(null)} />
        <PortfolioToastView toast={toast} onUndo={handleUndo} onDismiss={dismissToast} />
      </>
    </AppLayout>
  )
}

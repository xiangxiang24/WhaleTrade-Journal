import { useCallback, useState } from 'react'
import AppLayout from '../shared/app-shell/app-layout'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import type { CalcPlan } from '../shared/types/calc-plan'
import type { SidebarKey, SidebarUser } from '../shared/types/sidebar'
import PortfolioToastView from '../portfolio/components/portfolio-toast'
import PlanGrid from './components/plan-grid'
import PlanHeader from './components/plan-header'
import DeletePlanModal from './modals/delete-plan-modal'
import RenamePlanModal from './modals/rename-plan-modal'
import type { PlanToast } from './types/saved-plan'
import { useSavedPlans } from './types/use-saved-plans'

type SavedPlanProps = {
  user: SidebarUser
  /** จำนวน Reminder ที่ถึงเวลาแล้ว (badge ที่ Sidebar) */
  reminderBadge?: number
  /** เขตเวลาของผู้ใช้ (รหัส IANA จาก User.timezone) ใช้แปลงวันที่บันทึก */
  timeZone?: string
  onNavigate?: (key: SidebarKey) => void
  onLogout?: () => void
  /** เปิดหน้าสรุปผลของแผน */
  onOpenPlan?: (id: number) => void
}

// หน้า Saved Plans (Personal Vault): การ์ดแผนที่บันทึกจาก Target Calculator (เปิดดู / เปลี่ยนชื่อ / ลบ)
export default function SavedPlan({
  user,
  reminderBadge,
  timeZone = 'Asia/Bangkok',
  onNavigate,
  onLogout,
  onOpenPlan,
}: SavedPlanProps) {
  const { plans, names, status, reload, rename, remove } = useSavedPlans()
  const { leaving, leaveTo } = usePageLeave()
  const [renameTarget, setRenameTarget] = useState<CalcPlan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CalcPlan | null>(null)
  const [toast, setToast] = useState<PlanToast | null>(null)

  const showToast = useCallback((message: string) => setToast({ id: Date.now(), message }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  async function handleRename(plan: CalcPlan, name: string) {
    await rename(plan.id, name)
    showToast(`Renamed to “${name}”`)
  }

  async function handleDelete(plan: CalcPlan) {
    await remove(plan.id)
    showToast(`“${plan.name}” deleted`)
  }

  const goNewPlan = () => leaveTo(() => onNavigate?.('target-amount'))

  return (
    <AppLayout
      active="saved-plan"
      user={user}
      reminderBadge={reminderBadge}
      onNavigate={(key) => {
        if (key !== 'saved-plan') leaveTo(() => onNavigate?.(key))
      }}
      onLogout={() => onLogout?.()}
    >
      <>
        <div className={`pt-2 pb-6 ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
          <div className="animate-fade-up motion-reduce:animate-none">
            <PlanHeader count={status === 'ready' ? plans.length : null} onNewPlan={goNewPlan} />
          </div>

          <section
            aria-label="Saved plans"
            className="mt-6 animate-fade-up px-1 pb-2 [animation-delay:80ms] min-[640px]:mt-8 motion-reduce:animate-none"
          >
            <PlanGrid
              status={status}
              plans={plans}
              names={names}
              timeZone={timeZone}
              onOpen={(id) => leaveTo(onOpenPlan && (() => onOpenPlan(id)))}
              onRename={setRenameTarget}
              onDelete={setDeleteTarget}
              onNewPlan={goNewPlan}
              onRetry={reload}
            />
          </section>
        </div>

        {/* modal และ toast อยู่นอก wrapper ที่มี transform เพื่อให้ position: fixed อ้างอิงทั้งหน้าต่าง */}
        <RenamePlanModal plan={renameTarget} onSubmit={handleRename} onClose={() => setRenameTarget(null)} />
        <DeletePlanModal plan={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
        <PortfolioToastView toast={toast} onUndo={() => undefined} onDismiss={dismissToast} />
      </>
    </AppLayout>
  )
}

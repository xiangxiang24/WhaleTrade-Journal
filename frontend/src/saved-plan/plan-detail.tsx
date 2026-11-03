import { useCallback, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import banner from '../assets/Banner.png'
import AppLayout from '../shared/app-shell/app-layout'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import type { SidebarKey, SidebarUser } from '../shared/types/sidebar'
import PortfolioToastView from '../portfolio/components/portfolio-toast'
import ExpectedBanner from '../target-amount/components/expected-banner'
import ProportionCard from '../target-amount/components/proportion-card'
import DetailHeader from './components/detail-header'
import InputsCard from './components/inputs-card'
import StatStrip from './components/stat-strip'
import DeletePlanModal from './modals/delete-plan-modal'
import RenamePlanModal from './modals/rename-plan-modal'
import { exportPlanCsv, exportPlanImage } from './types/export-plan'
import { planSource, type PlanToast } from './types/saved-plan'
import { usePlanDetail } from './types/use-plan-detail'
import { useI18n } from '../shared/i18n/use-i18n'

type PlanDetailProps = {
  /** แผนที่เปิดดู (กด Open จากหน้า Saved Plans) */
  planId: number
  user: SidebarUser
  /** จำนวน Reminder ที่ถึงเวลาแล้ว (badge ที่ Sidebar) */
  reminderBadge?: number
  /** เขตเวลาของผู้ใช้ (รหัส IANA จาก User.timezone) */
  timeZone?: string
  onBack?: () => void
  onNavigate?: (key: SidebarKey) => void
  onLogout?: () => void
}

const PRIMARY_BUTTON =
  'inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900'

// หน้าสรุปผลของแผนที่บันทึก: คำนวณใหม่จากค่าที่บันทึก แสดงเงินปลายทาง สัดส่วน ตารางสรุป ค่าที่ใช้ และปุ่มส่งออก
export default function PlanDetail({
  planId,
  user,
  reminderBadge,
  timeZone = 'Asia/Bangkok',
  onBack,
  onNavigate,
  onLogout,
}: PlanDetailProps) {
  const { t } = useI18n()
  const { plan, names, result, status, reload, rename, remove } = usePlanDetail(planId)
  const { leaving, leaveTo } = usePageLeave()
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [exportingImage, setExportingImage] = useState(false)
  const [toast, setToast] = useState<PlanToast | null>(null)

  const showToast = useCallback((message: string) => setToast({ id: Date.now(), message }), [])
  const dismissToast = useCallback(() => setToast(null), [])
  const goBack = () => leaveTo(onBack)

  async function handleExport(kind: 'CSV' | 'PDF' | 'image') {
    if (!plan || !result) return
    const source = planSource(plan, names)
    if (kind === 'CSV') {
      exportPlanCsv(plan, source, result.output)
      showToast(t('Plan exported as CSV'))
    } else if (kind === 'image') {
      setExportingImage(true)
      try {
        await exportPlanImage(plan, source, result.output)
        showToast(t('Plan exported as an image'))
      } catch (caught) {
        showToast(t(caught instanceof Error ? caught.message : 'Could not create the image. Please try again.'))
      } finally {
        setExportingImage(false)
      }
    } else {
      // PDF ต้องใช้โปรเซสหลักของ Electron จึงทำตอนต่อ backend (ตอนนี้แจ้งผู้ใช้)
      showToast(t('Export PDF will be available once the app is connected.'))
    }
  }

  return (
    <AppLayout
      active="saved-plan"
      user={user}
      reminderBadge={reminderBadge}
      onNavigate={(key) => {
        if (key === 'saved-plan') goBack()
        else leaveTo(() => onNavigate?.(key))
      }}
      onLogout={() => onLogout?.()}
    >
      <>
        <div className={`pt-2 pb-6 ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
          {status === 'loading' && (
            <div role="status" aria-label={t('Loading your plan')} className="flex flex-col gap-4">
              <div className="h-10 w-52 animate-pulse rounded-pill bg-blue-100 motion-reduce:animate-none" />
              <div className="h-16 w-full max-w-lg animate-pulse rounded-3xl bg-blue-100 motion-reduce:animate-none" />
              <div className="grid grid-cols-2 gap-3 min-[1024px]:grid-cols-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="h-24 animate-pulse rounded-3xl bg-blue-100 motion-reduce:animate-none" />
                ))}
              </div>
              <div className="h-56 animate-pulse rounded-4xl bg-blue-100 motion-reduce:animate-none" />
            </div>
          )}

          {(status === 'error' || status === 'missing') && (
            <div className="flex flex-col items-center rounded-4xl bg-surface px-6 py-12 text-center shadow-md">
              <img className="h-36 w-auto min-[640px]:h-44" src={banner} alt="" />
              <p className="m-0 mt-4 text-[18px] leading-7 font-bold text-navy-900">
                {status === 'missing' ? t('This plan is not here anymore') : t('Could not load this plan')}
              </p>
              <p className="m-0 mt-1 max-w-110 text-[14px] leading-6 text-text-muted">
                {status === 'missing'
                  ? t('It may have been deleted. Head back to your saved plans to pick another one.')
                  : t('Something went wrong. Please try again.')}
              </p>
              <button type="button" onClick={status === 'missing' ? goBack : reload} className={`${PRIMARY_BUTTON} mt-6`}>
                {status === 'missing' ? t('Back to Saved Plans') : t('Try again')}
              </button>
            </div>
          )}

          {status === 'ready' && plan && result && (
            <>
              <div className="animate-fade-up motion-reduce:animate-none">
                <DetailHeader
                  plan={plan}
                  names={names}
                  timeZone={timeZone}
                  exportingImage={exportingImage}
                  onBack={goBack}
                  onRename={() => setRenameOpen(true)}
                  onDelete={() => setDeleteOpen(true)}
                  onExport={handleExport}
                />
              </div>

              <div className="mt-6 flex animate-fade-up flex-col gap-5 px-1 [animation-delay:80ms] min-[1280px]:gap-6 motion-reduce:animate-none">
                <StatStrip result={result} />
                <ExpectedBanner output={result.output} />
                {/* ≥ 1360: ตารางสรุปกับค่าที่ใช้คำนวณเคียงกัน; น้อยกว่านั้นเรียงต่อกัน */}
                <div className="grid gap-5 min-[1360px]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] min-[1360px]:items-start min-[1280px]:gap-6">
                  <ProportionCard result={result} />
                  <InputsCard plan={plan} />
                </div>
                <p className="m-0 flex items-center justify-center gap-2 text-[12px] leading-5 text-text-muted">
                  <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
                  {t('Verified 100% Client-Side Simulation')}
                </p>
              </div>
            </>
          )}
        </div>

        {/* modal และ toast อยู่นอก wrapper ที่มี transform เพื่อให้ position: fixed อ้างอิงทั้งหน้าต่าง */}
        <RenamePlanModal
          plan={renameOpen ? plan : null}
          onSubmit={async (_plan, name) => {
            await rename(name)
            showToast(t('Renamed to “{name}”', { name }))
          }}
          onClose={() => setRenameOpen(false)}
        />
        <DeletePlanModal
          plan={deleteOpen ? plan : null}
          onConfirm={async () => {
            await remove()
            // ลบแล้วกลับหน้ารายการ (หน้านี้ไม่มีแผนให้ดูอีก)
            leaveTo(onBack)
          }}
          onClose={() => setDeleteOpen(false)}
        />
        <PortfolioToastView toast={toast} onUndo={() => undefined} onDismiss={dismissToast} />
      </>
    </AppLayout>
  )
}

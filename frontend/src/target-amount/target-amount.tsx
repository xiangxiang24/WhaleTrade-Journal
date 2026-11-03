import { useCallback, useRef, useState } from 'react'
import AppLayout from '../shared/app-shell/app-layout'
import { createCalcPlan } from '../shared/data/calc-plans'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import type { SidebarKey, SidebarUser } from '../shared/types/sidebar'
import PortfolioToastView from '../portfolio/components/portfolio-toast'
import EstimateSection from './components/estimate-section'
import NumbersStep from './components/numbers-step'
import PhasesStep from './components/phases-step'
import SourceStep from './components/source-step'
import SummaryCard from './components/summary-card'
import TargetHeader from './components/target-header'
import SavePlanModal from './modals/save-plan-modal'
import type { ReminderToast } from '../reminder/types/reminder'
import { useCalculator } from './types/use-calculator'
import { useI18n } from '../shared/i18n/use-i18n'

type TargetAmountProps = {
  user: SidebarUser
  /** จำนวน Reminder ที่ถึงเวลาแล้ว (badge ที่ Sidebar) */
  reminderBadge?: number
  onNavigate?: (key: SidebarKey) => void
  onLogout?: () => void
}

// หน้า Target Calculator: ฟอร์ม 3 ขั้นตอน (ซ้าย) + Sanctuary Summary (ขวา/บนในจอแคบ) แล้วผลประมาณการด้านล่างหลังกด Calculate
export default function TargetAmount({ user, reminderBadge, onNavigate, onLogout }: TargetAmountProps) {
  const { t } = useI18n()
  const calc = useCalculator()
  const { leaving, leaveTo } = usePageLeave()
  const [saveOpen, setSaveOpen] = useState(false)
  const [toast, setToast] = useState<ReminderToast | null>(null)
  const estimateRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((message: string) => setToast({ id: Date.now(), message }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  function handleCalculate() {
    if (!calc.calculate()) return
    // เลื่อนลงไปที่ผลลัพธ์ (หลัง React วาดผลแล้ว) ผู้ใช้ reduce motion เลื่อนทันที
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTimeout(() => estimateRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), 50)
  }

  async function handleSave(name: string) {
    const result = calc.result
    if (!result) return
    await createCalcPlan({
      portfolioId: result.portfolioId,
      name,
      principal: result.input.principal,
      resultAmount: result.output.total,
      phases: result.input.phases,
      assets: result.assets.map(({ assetId, dividendPct }) => ({ assetId, dividendPct })),
    })
    showToast(t('“{name}” saved to Saved Plans', { name }))
  }

  // ส่งออก PDF/รูปภาพต้องใช้โปรเซสหลักของ Electron จึงทำตอนต่อ backend (ตอนนี้แจ้งผู้ใช้)
  const handleExport = (kind: 'PDF' | 'image') => showToast(t('Export {kind} will be available once the app is connected.', { kind: t(kind) }))

  const defaultName = t('{n}-year quiet sanctuary', { n: calc.summary.totalYears })

  return (
    <AppLayout
      active="target-amount"
      user={user}
      reminderBadge={reminderBadge}
      onNavigate={(key) => {
        if (key !== 'target-amount') leaveTo(() => onNavigate?.(key))
      }}
      onLogout={() => onLogout?.()}
    >
      <>
        <div className={`pt-2 pb-6 ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
          <div className="animate-fade-up motion-reduce:animate-none">
            <TargetHeader />
          </div>

          {/* ≥ 1280: ฟอร์ม + การ์ดสรุปติดขวา; น้อยกว่านั้นการ์ดสรุปขึ้นไปอยู่บนฟอร์มเป็นแถบแนวนอน (design rules 5.2) */}
          <div className="mt-6 grid animate-fade-up grid-cols-1 gap-5 px-1 [animation-delay:80ms] min-[1280px]:grid-cols-[minmax(0,1fr)_320px] min-[1280px]:items-start min-[1280px]:gap-6 motion-reduce:animate-none">
            <div className="min-w-0 min-[1280px]:col-start-2 min-[1280px]:row-start-1">
              <SummaryCard calc={calc} onCalculate={handleCalculate} />
            </div>
            <div className="flex min-w-0 flex-col gap-5 min-[1280px]:col-start-1 min-[1280px]:row-start-1">
              <SourceStep calc={calc} />
              <NumbersStep calc={calc} />
              <PhasesStep calc={calc} />
            </div>
          </div>

          <div ref={estimateRef} className="scroll-mt-2 px-1">
            <EstimateSection
              result={calc.result}
              stale={calc.stale}
              onSave={() => setSaveOpen(true)}
              onExport={handleExport}
            />
          </div>
        </div>

        {/* modal และ toast อยู่นอก wrapper ที่มี transform เพื่อให้ position: fixed อ้างอิงทั้งหน้าต่าง */}
        <SavePlanModal open={saveOpen} defaultName={defaultName} onSubmit={handleSave} onClose={() => setSaveOpen(false)} />
        <PortfolioToastView toast={toast} onUndo={() => undefined} onDismiss={dismissToast} />
      </>
    </AppLayout>
  )
}

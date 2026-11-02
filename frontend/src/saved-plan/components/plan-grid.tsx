import { Calculator } from 'lucide-react'
import banner from '../../assets/Banner.png'
import type { CalcPlan } from '../../shared/types/calc-plan'
import type { SavedPlanLoadStatus } from '../types/saved-plan'
import PlanCard from './plan-card'

type PlanGridProps = {
  status: SavedPlanLoadStatus
  plans: CalcPlan[]
  names: Map<number, string>
  timeZone: string
  onOpen: (id: number) => void
  onRename: (plan: CalcPlan) => void
  onDelete: (plan: CalcPlan) => void
  onNewPlan: () => void
  onRetry: () => void
}

// คอลัมน์ปรับเองตามความกว้าง (การ์ดกว้างอย่างน้อย 280 → 2 / 3 / 4 คอลัมน์ตามหัวข้อ 5.2) ช่องว่าง 16 / 24
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4 min-[1280px]:gap-6'

const PRIMARY_BUTTON =
  'inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900'

function Message({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-4xl bg-surface px-6 py-12 text-center shadow-md">
      <img className="h-40 w-auto min-[640px]:h-48" src={banner} alt="" />
      <p className="m-0 mt-4 text-[18px] leading-7 font-bold text-navy-900">{title}</p>
      <p className="m-0 mt-1 max-w-110 text-[14px] leading-6 text-text-muted">{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  )
}

// กริดการ์ดแผน + สถานะ กำลังโหลด / ผิดพลาด / ยังไม่มีแผน (Empty state)
export default function PlanGrid({ status, plans, names, timeZone, onOpen, onRename, onDelete, onNewPlan, onRetry }: PlanGridProps) {
  if (status === 'loading') {
    return (
      <div className={GRID} role="status" aria-label="Loading your saved plans">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-60 animate-pulse rounded-4xl bg-blue-100 motion-reduce:animate-none" />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Message
        title="Could not load your saved plans"
        description="Something went wrong. Please try again."
        action={
          <button type="button" onClick={onRetry} className={PRIMARY_BUTTON}>
            Try again
          </button>
        }
      />
    )
  }

  if (plans.length === 0) {
    return (
      <Message
        title="No saved plans yet"
        description="Calculate a target in the Target Calculator, then press Save plan to keep it here."
        action={
          <button type="button" onClick={onNewPlan} className={PRIMARY_BUTTON}>
            <Calculator size={18} strokeWidth={1.75} aria-hidden="true" />
            Open Target Calculator
          </button>
        }
      />
    )
  }

  return (
    <ul className={`${GRID} m-0 list-none p-0`}>
      {plans.map((plan) => (
        <li key={plan.id} className="min-w-0">
          <PlanCard plan={plan} names={names} timeZone={timeZone} onOpen={onOpen} onRename={onRename} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  )
}

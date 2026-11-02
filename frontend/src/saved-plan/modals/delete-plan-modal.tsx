import { useEffect, useId, useState } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import type { CalcPlan } from '../../shared/types/calc-plan'

type DeletePlanModalProps = {
  /** แผนที่จะลบ (ว่าง = ปิด) */
  plan: CalcPlan | null
  /** ลบ: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงในกล่อง) */
  onConfirm: (plan: CalcPlan) => Promise<void>
  onClose: () => void
}

const EXIT_MS = 200

function Dialog({ plan, onConfirm, onClose }: Omit<DeletePlanModalProps, 'plan'> & { plan: CalcPlan }) {
  const [closing, setClosing] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string>()
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  async function handleConfirm() {
    if (working) return
    setWorking(true)
    setError(undefined)
    try {
      await onConfirm(plan)
      setClosing(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete this plan. Please try again.')
      setWorking(false)
    }
  }

  return (
    <ModalFrame
      titleId={titleId}
      descId={descId}
      closing={closing}
      onRequestClose={() => {
        if (!working) setClosing(true)
      }}
      cardClassName="max-w-105 p-6 text-left"
    >
      <h2 id={titleId} className="m-0 text-[20px] leading-7 font-bold text-navy-900">
        Delete “{plan.name}”?
      </h2>
      <p id={descId} className="m-0 mt-2 text-[14px] leading-6 text-navy-700">
        This saved plan will be permanently deleted. You can always calculate and save a new one. This action cannot be undone.
      </p>

      {error && (
        <p role="alert" className="m-0 mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
          <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          data-autofocus
          type="button"
          disabled={working}
          onClick={() => setClosing(true)}
          className="inline-flex h-11 items-center rounded-pill border-2 border-blue-200 bg-surface px-6 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={working}
          onClick={handleConfirm}
          className="inline-flex h-11 items-center rounded-pill bg-red-500 px-6 text-[14px] leading-5 font-semibold text-surface transition-[filter] duration-150 hover:brightness-110 active:brightness-95 disabled:opacity-50"
        >
          {working ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </ModalFrame>
  )
}

// กล่องยืนยันลบแผน (ถามก่อนลบทุกครั้ง) Cancel เป็นโฟกัสเริ่มต้นกันกดลบพลาด
export default function DeletePlanModal({ plan, ...props }: DeletePlanModalProps) {
  return plan ? <Dialog plan={plan} {...props} /> : null
}

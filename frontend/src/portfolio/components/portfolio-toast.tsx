import { useEffect } from 'react'
import { Undo2 } from 'lucide-react'
import type { PortfolioToast } from '../types/portfolio'
import { useI18n } from '../../shared/i18n/use-i18n'

type PortfolioToastProps = {
  toast: PortfolioToast | null
  onUndo: (id: number) => void
  onDismiss: () => void
}

const VISIBLE_MS = 6000

// ข้อความแจ้งผลท้ายหน้า (เช่น ย้ายพอร์ตไปถังขยะ + Undo) หายเองหลัง 6 วินาที
export default function PortfolioToastView({ toast, onUndo, onDismiss }: PortfolioToastProps) {
  const { t } = useI18n()
  const toastId = toast?.id
  useEffect(() => {
    if (toastId === undefined) return
    const timer = setTimeout(onDismiss, VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [toastId, onDismiss])

  if (!toast) return null

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-40 flex justify-center min-[640px]:bottom-6">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex max-w-full animate-fade-up items-center gap-3 rounded-pill bg-navy-900 py-2 pr-2 pl-5 text-[14px] leading-5 text-surface shadow-lg motion-reduce:animate-none"
      >
        <span className="min-w-0 truncate">{toast.message}</span>
        {toast.undoId !== undefined && (
          <button
            type="button"
            onClick={() => onUndo(toast.undoId as number)}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-pill bg-surface px-3 text-[13px] leading-5 font-semibold text-navy-900 hover:bg-blue-100"
          >
            <Undo2 size={14} strokeWidth={1.75} aria-hidden="true" />
            {t('Undo')}
          </button>
        )}
      </div>
    </div>
  )
}

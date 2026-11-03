import { useEffect, useId, useState } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import type { Portfolio } from '../../shared/types/portfolio'
import { useI18n } from '../../shared/i18n/use-i18n'

type TrashPortfolioModalProps = {
  /** พอร์ตที่จะย้ายไปถังขยะ (ว่าง = ปิด) */
  portfolio: Portfolio | null
  /** ย้ายไปถังขยะ: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงในกล่อง) */
  onConfirm: (portfolio: Portfolio) => Promise<void>
  /** เรียกเมื่อ modal ปิดเสร็จ (สำเร็จ, กด Cancel หรือกด Esc) */
  onClose: () => void
}

const EXIT_MS = 200

function Dialog({ portfolio, onConfirm, onClose }: Omit<TrashPortfolioModalProps, 'portfolio'> & { portfolio: Portfolio }) {
  const { t } = useI18n()
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
      await onConfirm(portfolio)
      setClosing(true)
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : 'Could not move this portfolio. Please try again.'))
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
        {t('Move “{name}” to Trash?', { name: portfolio.name })}
      </h2>
      <p id={descId} className="m-0 mt-2 text-[14px] leading-6 text-navy-700">
        {t(
          portfolio.entries === 1
            ? 'It will disappear from your portfolios and the target calculator. Your {n} transaction is kept, and you can restore it from Trash anytime.'
            : 'It will disappear from your portfolios and the target calculator. Your {n} transactions are kept, and you can restore it from Trash anytime.',
          { n: portfolio.entries },
        )}
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
          {t('Cancel')}
        </button>
        <button
          type="button"
          disabled={working}
          onClick={handleConfirm}
          className="inline-flex h-11 items-center rounded-pill bg-red-500 px-6 text-[14px] leading-5 font-semibold text-surface transition-[filter] duration-150 hover:brightness-110 active:brightness-95 disabled:opacity-50"
        >
          {working ? t('Moving…') : t('Move to Trash')}
        </button>
      </div>
    </ModalFrame>
  )
}

// กล่องยืนยัน Soft Delete พอร์ต (design rules 7.6): Cancel (Secondary, โฟกัสเริ่มต้น) + Danger solid
export default function TrashPortfolioModal({ portfolio, ...props }: TrashPortfolioModalProps) {
  return portfolio ? <Dialog portfolio={portfolio} {...props} /> : null
}

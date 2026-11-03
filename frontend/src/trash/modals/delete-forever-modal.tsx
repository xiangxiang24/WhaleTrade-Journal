import { useEffect, useId, useState } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import { useI18n } from '../../shared/i18n/use-i18n'
import type { PurgeTarget } from '../types/trash'

type DeleteForeverModalProps = {
  /** รายการที่จะลบถาวร (ว่าง = ปิด) */
  target: PurgeTarget | null
  /** ลบถาวร: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงในกล่อง) */
  onConfirm: (target: PurgeTarget) => Promise<void>
  onClose: () => void
}

const EXIT_MS = 200
const DEFAULT_TITLE = 'Today Journal'

function Dialog({ target, onConfirm, onClose }: Omit<DeleteForeverModalProps, 'target'> & { target: PurgeTarget }) {
  const { t } = useI18n()
  const [closing, setClosing] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string>()
  const titleId = useId()
  const descId = useId()

  const name =
    target.kind === 'journal' ? target.note.title?.trim() || t(DEFAULT_TITLE) : target.portfolio.name

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
      await onConfirm(target)
      setClosing(true)
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : 'Could not delete this item. Please try again.'))
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
      cardClassName="max-w-110 p-6 text-left"
    >
      <h2 id={titleId} className="m-0 text-[20px] leading-7 font-bold break-words text-navy-900">
        {t('Delete “{name}” forever?', { name })}
      </h2>

      <div id={descId} className="mt-2 text-[14px] leading-6 text-navy-700">
        {target.kind === 'journal' ? (
          <p className="m-0">{t('This journal will be permanently deleted. This action cannot be undone.')}</p>
        ) : (
          <>
            <p className="m-0">{t('This portfolio will be permanently deleted. This action cannot be undone.')}</p>
            <ul className="m-0 mt-3 flex list-disc flex-col gap-1.5 pl-5">
              <li>
                {t(
                  target.portfolio.entries === 1
                    ? '{n} transaction will be deleted for good.'
                    : '{n} transactions will be deleted for good.',
                  { n: target.portfolio.entries },
                )}
              </li>
              <li>
                {target.portfolio.planCount === 0
                  ? t('No saved plans use this portfolio.')
                  : t(
                      target.portfolio.planCount === 1
                        ? '{n} saved plan will be kept, but its source changes to “Manual Portfolio”.'
                        : '{n} saved plans will be kept, but their source changes to “Manual Portfolio”.',
                      { n: target.portfolio.planCount },
                    )}
              </li>
            </ul>
          </>
        )}
      </div>

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
          {working ? t('Deleting…') : t('Delete forever')}
        </button>
      </div>
    </ModalFrame>
  )
}

// กล่องยืนยันลบถาวรทีละรายการ (พอร์ตบอกผลกระทบเป็นตัวเลข) Cancel เป็นโฟกัสเริ่มต้น
export default function DeleteForeverModal({ target, ...props }: DeleteForeverModalProps) {
  return target ? <Dialog target={target} {...props} /> : null
}

import { useEffect, useId, useState } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import { useI18n } from '../../shared/i18n/use-i18n'

type RestoreBackupModalProps = {
  /** วันเวลาที่สร้างชุดสำรองที่เลือก (ISO) ไม่ส่ง = ปิดกล่อง */
  createdAt: string | null
  /** กู้คืน: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงในกล่อง) สำเร็จแล้วแอปจะรีสตาร์ตเอง */
  onConfirm: () => Promise<void>
  onClose: () => void
}

const EXIT_MS = 200

function Dialog({ createdAt, onConfirm, onClose }: Omit<RestoreBackupModalProps, 'createdAt'> & { createdAt: string }) {
  const { t, language } = useI18n()
  const [error, setError] = useState<string>()
  const [working, setWorking] = useState(false)
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  const when = new Date(createdAt).toLocaleString(language === 'th' ? 'th-TH' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })

  async function handleConfirm() {
    if (working) return
    setWorking(true)
    setError(undefined)
    try {
      await onConfirm()
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : 'Could not restore this backup. Please try again.'))
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
      <h2 id={titleId} className="m-0 text-[20px] leading-7 font-bold text-navy-900">
        {t('Restore this backup?')}
      </h2>
      <p id={descId} className="m-0 mt-2 text-[14px] leading-6 text-navy-700">
        {t('Everything in the app will be replaced with the backup made on {date}. Changes made after that will be lost. A copy of your current data is kept first, and the app will restart.').replace('{date}', when)}
      </p>
      {error && (
        <p role="alert" className="m-0 mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
          <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          data-autofocus
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
          {working ? t('Restoring…') : t('Restore backup')}
        </button>
      </div>
    </ModalFrame>
  )
}

// กล่องยืนยันกู้คืนข้อมูลจากชุดสำรอง (mount เฉพาะตอนเปิด)
export default function RestoreBackupModal({ createdAt, ...props }: RestoreBackupModalProps) {
  return createdAt ? <Dialog createdAt={createdAt} {...props} /> : null
}

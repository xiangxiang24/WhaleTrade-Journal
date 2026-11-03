import { useEffect, useId, useState, type FormEvent } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import { useI18n } from '../../shared/i18n/use-i18n'

type DeleteAccountModalProps = {
  open: boolean
  /** ลบบัญชี: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงในกล่อง) */
  onConfirm: () => Promise<void>
  onClose: () => void
}

const EXIT_MS = 200
const CONFIRM_WORD = 'DELETE'

function Dialog({ onConfirm, onClose }: Omit<DeleteAccountModalProps, 'open'>) {
  const { t } = useI18n()
  const [typed, setTyped] = useState('')
  const [error, setError] = useState<string>()
  const [working, setWorking] = useState(false)
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const descId = useId()
  const inputId = useId()
  // ต้องพิมพ์ DELETE ตัวพิมพ์ใหญ่ตรงตัวจึงกดลบได้ (กันกดพลาด)
  const ready = typed === CONFIRM_WORD

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!ready || working) return
    setWorking(true)
    setError(undefined)
    try {
      await onConfirm()
      setClosing(true)
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : 'Could not delete your account. Please try again.'))
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
        {t('Delete your account?')}
      </h2>
      <p id={descId} className="m-0 mt-2 text-[14px] leading-6 text-navy-700">
        {t('Your journal notes, portfolios, transactions, reminders and saved plans will be permanently deleted. This action cannot be undone.')}
      </p>

      <form noValidate onSubmit={handleSubmit} className="mt-4">
        <label htmlFor={inputId} className="block text-[12px] leading-4 font-semibold text-navy-900">
          {t('Type the word')} <span className="font-bold tracking-[0.08em]">{CONFIRM_WORD}</span> {t('to confirm')}
        </label>
        <input
          id={inputId}
          data-autofocus
          value={typed}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(event) => setTyped(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-pill border-2 border-red-500 bg-surface px-4 text-[14px] tracking-[0.08em] text-navy-900 outline-none transition-shadow duration-150 focus:shadow-focus"
        />
        {error && (
          <p role="alert" className="m-0 mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={working}
            onClick={() => setClosing(true)}
            className="inline-flex h-11 items-center rounded-pill border-2 border-blue-200 bg-surface px-6 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50"
          >
            {t('Cancel')}
          </button>
          <button
            type="submit"
            disabled={!ready || working}
            className="inline-flex h-11 items-center rounded-pill bg-red-500 px-6 text-[14px] leading-5 font-semibold text-surface transition-[filter] duration-150 hover:brightness-110 active:brightness-95 disabled:opacity-50"
          >
            {working ? t('Deleting…') : t('Delete account')}
          </button>
        </div>
      </form>
    </ModalFrame>
  )
}

// กล่องยืนยันลบบัญชี: ต้องพิมพ์ DELETE ก่อนปุ่มลบจะกดได้ (mount เฉพาะตอนเปิด)
export default function DeleteAccountModal({ open, ...props }: DeleteAccountModalProps) {
  return open ? <Dialog {...props} /> : null
}

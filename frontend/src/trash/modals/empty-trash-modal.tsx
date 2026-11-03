import { useEffect, useId, useState, type FormEvent } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import { useI18n } from '../../shared/i18n/use-i18n'
import type { TrashTab } from '../types/trash'

type EmptyTrashModalProps = {
  /** แท็บที่จะล้าง (ว่าง = ปิด) */
  tab: TrashTab | null
  /** จำนวนรายการในแท็บนั้น */
  count: number
  /** ล้างถังขยะ: ถ้าไม่สำเร็จให้ throw Error */
  onConfirm: (tab: TrashTab) => Promise<void>
  onClose: () => void
}

const EXIT_MS = 200
const CONFIRM_WORD = 'DELETE'

function Dialog({ tab, count, onConfirm, onClose }: Omit<EmptyTrashModalProps, 'tab'> & { tab: TrashTab }) {
  const { t } = useI18n()
  const [typed, setTyped] = useState('')
  const [closing, setClosing] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string>()
  const titleId = useId()
  const descId = useId()
  const inputId = useId()
  const ready = typed.trim() === CONFIRM_WORD

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
      await onConfirm(tab)
      setClosing(true)
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : 'Could not empty the trash. Please try again.'))
      setWorking(false)
    }
  }

  const description =
    tab === 'journals'
      ? t(count === 1 ? '{n} journal will be permanently deleted.' : '{n} journals will be permanently deleted.', { n: count })
      : t(
          count === 1
            ? '{n} portfolio and all of its transactions will be permanently deleted.'
            : '{n} portfolios and all of their transactions will be permanently deleted.',
          { n: count },
        )

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
        {tab === 'journals' ? t('Empty the Journals trash?') : t('Empty the Portfolios trash?')}
      </h2>
      <p id={descId} className="m-0 mt-2 text-[14px] leading-6 text-navy-700">
        {description} {t('This action cannot be undone.')}
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
            {working ? t('Deleting…') : t('Empty trash')}
          </button>
        </div>
      </form>
    </ModalFrame>
  )
}

// กล่องยืนยันล้างถังขยะของแท็บที่เปิดอยู่: ต้องพิมพ์ DELETE และแสดงจำนวนที่จะถูกลบ (mount เฉพาะตอนเปิด)
export default function EmptyTrashModal({ tab, ...props }: EmptyTrashModalProps) {
  return tab ? <Dialog tab={tab} {...props} /> : null
}

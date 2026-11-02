import { useEffect, useId, useState } from 'react'
import { CircleAlert } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'

type DeleteJournalModalProps = {
  open: boolean
  /** ลบโน้ต: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงในกล่อง) */
  onConfirm: () => Promise<void>
  /** เรียกเมื่อ modal ปิดเสร็จ (ลบสำเร็จ, กด Cancel หรือกด Esc) */
  onClose: () => void
}

const EXIT_MS = 200

function Dialog({ onConfirm, onClose }: Omit<DeleteJournalModalProps, 'open'>) {
  const [closing, setClosing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string>()
  const titleId = useId()
  const descId = useId()

  // รอให้แอนิเมชันออกเล่นจบก่อนค่อยแจ้งผู้เรียก
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  async function handleDelete() {
    if (deleting) return
    setDeleting(true)
    setError(undefined)
    try {
      await onConfirm()
      setClosing(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete this journal. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <ModalFrame
      titleId={titleId}
      descId={descId}
      closing={closing}
      onRequestClose={() => {
        if (!deleting) setClosing(true)
      }}
      cardClassName="max-w-105 p-6 text-left"
    >
      <h2 id={titleId} className="m-0 text-[20px] leading-7 font-bold text-navy-900">
        Delete this journal?
      </h2>
      <p id={descId} className="m-0 mt-2 text-[14px] leading-6 text-navy-700">
        This journal and its draft will be permanently deleted. This action cannot be undone.
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
          disabled={deleting}
          onClick={() => setClosing(true)}
          className="inline-flex h-11 items-center rounded-pill border border-blue-200 bg-surface px-6 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={handleDelete}
          className="inline-flex h-11 items-center rounded-pill bg-red-500 px-6 text-[14px] leading-5 font-semibold text-surface transition-[filter] duration-150 hover:brightness-110 active:brightness-95 disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </ModalFrame>
  )
}

// กล่องยืนยันลบ (design rules หัวข้อ 7.6): Cancel (Secondary) + Delete (Danger solid)
export default function DeleteJournalModal({ open, ...props }: DeleteJournalModalProps) {
  return open ? <Dialog {...props} /> : null
}

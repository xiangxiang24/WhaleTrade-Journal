import { useEffect, useId, useState } from 'react'
import { CircleAlert } from 'lucide-react'
import { ASSET_BY_ID } from '../../shared/data/assets'
import ModalFrame from '../../shared/modal/modal-frame'
import type { Transaction } from '../../shared/types/transaction'
import { TYPE_LABEL } from '../types/type-label'
import { formatTxDate } from '../types/format'

type DeleteTransactionModalProps = {
  /** รายการที่จะลบ (ว่าง = ปิด) */
  transaction: Transaction | null
  /** ลบ: ถ้าไม่สำเร็จให้ throw Error (ข้อความจะแสดงในกล่อง) */
  onConfirm: (transaction: Transaction) => Promise<void>
  onClose: () => void
}

const EXIT_MS = 200

function Dialog({ transaction, onConfirm, onClose }: Omit<DeleteTransactionModalProps, 'transaction'> & { transaction: Transaction }) {
  const [closing, setClosing] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string>()
  const titleId = useId()
  const descId = useId()
  const asset = ASSET_BY_ID.get(transaction.assetId)

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
      await onConfirm(transaction)
      setClosing(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete this transaction. Please try again.')
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
        Delete this transaction?
      </h2>
      <p id={descId} className="m-0 mt-2 text-[14px] leading-6 text-navy-700">
        {TYPE_LABEL[transaction.type]} · {asset?.ticker ?? 'Unknown'} · {formatTxDate(transaction.date)} will be permanently
        deleted and your goal progress will update. This action cannot be undone.
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

// กล่องยืนยันลบ transaction (ลบจริง ไม่มีถังขยะ) Cancel เป็นโฟกัสเริ่มต้นกันกดลบพลาด
export default function DeleteTransactionModal({ transaction, ...props }: DeleteTransactionModalProps) {
  return transaction ? <Dialog transaction={transaction} {...props} /> : null
}

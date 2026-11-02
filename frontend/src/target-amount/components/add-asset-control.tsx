import { useState } from 'react'
import { CircleAlert, Plus } from 'lucide-react'
import AssetPicker from '../../shared/asset-picker/asset-picker'
import type { Asset } from '../../shared/types/transaction'

type AddAssetControlProps = {
  /** เพิ่ม asset (ซ้ำ = false) */
  onAdd: (asset: Asset) => boolean
  /** แสดงช่องค้นหาตลอด (โหมดกรอกเอง) หรือพับไว้หลังปุ่มเส้นประ (โหมดเลือกพอร์ต) */
  alwaysOpen: boolean
}

// เพิ่มหุ้น/กองทุนเข้ารายการ: ช่องค้นหาจากรายการกลาง (Feature 6) + ปุ่ม Add
export default function AddAssetControl({ onAdd, alwaysOpen }: AddAssetControlProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<Asset | null>(null)
  const [version, setVersion] = useState(0)
  const [error, setError] = useState<string>()

  if (!alwaysOpen && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-pill border-2 border-dashed border-blue-200 bg-surface text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:border-blue-500 hover:bg-blue-50"
      >
        <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
        Add Dividend and Ticker
      </button>
    )
  }

  function handleAdd() {
    if (!pending) {
      setError('Choose a stock or fund from the list first.')
      return
    }
    if (!onAdd(pending)) {
      setError(`${pending.ticker} is already in the list.`)
      return
    }
    setError(undefined)
    setPending(null)
    // เปลี่ยน key ให้ช่องค้นหาเริ่มใหม่ (ล้างข้อความ)
    setVersion((current) => current + 1)
    if (!alwaysOpen) setOpen(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1 basis-56">
          <AssetPicker
            key={version}
            label="Type name or ticker"
            value={pending}
            onChange={(asset) => {
              setPending(asset)
              setError(undefined)
            }}
          />
        </div>
        <div className="flex gap-2 max-[639px]:w-full min-[640px]:mt-[22px]">
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-pill bg-blue-500 px-5 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900"
          >
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            Add
          </button>
          {!alwaysOpen && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                setPending(null)
                setError(undefined)
              }}
              className="inline-flex h-11 items-center rounded-pill border-2 border-blue-200 bg-surface px-5 text-[14px] leading-5 font-semibold text-navy-700 hover:border-blue-500 hover:bg-blue-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="m-0 mt-1.5 flex items-start gap-1.5 text-[12px] leading-4 text-navy-900">
          <CircleAlert size={14} strokeWidth={1.75} className="mt-px shrink-0 text-red-500" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

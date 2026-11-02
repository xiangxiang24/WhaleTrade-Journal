import { Trash2 } from 'lucide-react'

type EditorFooterProps = {
  /** มีการเปลี่ยนแปลงที่ยังไม่บันทึกหรือไม่ (ไม่มี = กด Save Changes ไม่ได้) */
  canSave: boolean
  saving: boolean
  onDelete: () => void
  onCancel: () => void
}

// แถวปุ่มท้ายหน้า: Delete journal (ซ้ายสุด) / Cancel + Save Changes (ขวา) จอเล็กเรียงลงบรรทัดใหม่
export default function EditorFooter({ canSave, saving, onDelete, onCancel }: EditorFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex h-11 items-center gap-2 rounded-pill border border-red-500 bg-surface px-5 text-[14px] leading-5 font-semibold text-red-500 transition-colors duration-150 hover:bg-red-50 active:bg-red-50"
      >
        <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
        Delete journal
      </button>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center rounded-pill border border-blue-200 bg-surface px-6 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSave || saving}
          className="inline-flex h-11 items-center rounded-pill bg-blue-500 px-6 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:shadow-none min-[640px]:px-8 min-[640px]:text-[16px]"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

import { Cloud, Eye, EyeOff, Leaf, Plus, Trash2 } from 'lucide-react'

type PortfolioHeaderProps = {
  /** จำนวนพอร์ตที่ยังไม่อยู่ในถังขยะ (null = กำลังโหลด) */
  count: number | null
  previewEmpty: boolean
  onTogglePreview: () => void
  onOpenTrash: () => void
  onCreate: () => void
}

// ข้อความตกแต่งคงที่ของหน้าจอ (ยังไม่ผ่านระบบแปลภาษา)
const TITLE = 'Your Portfolios'
const SUBTITLE = "Each portfolio is its own quiet little garden. Open one whenever you're ready."

// ส่วนหัว: ชิปด่วน (จำนวนพอร์ต + Preview empty slate) / ชื่อหน้า + คำอธิบาย / ปุ่ม Trash + Create Portfolio
export default function PortfolioHeader({
  count,
  previewEmpty,
  onTogglePreview,
  onOpenTrash,
  onCreate,
}: PortfolioHeaderProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex h-10 items-center gap-2 rounded-pill bg-blue-100 px-4 text-[16px] leading-6 font-semibold text-navy-700">
          <Cloud size={20} strokeWidth={1.75} aria-hidden="true" />
          {count === null ? 'Loading…' : `${count} ${count === 1 ? 'portfolio' : 'portfolios'}`}
        </span>
        <button
          type="button"
          aria-pressed={previewEmpty}
          onClick={onTogglePreview}
          className={`inline-flex h-10 items-center gap-2 rounded-pill px-4 text-[16px] leading-6 font-semibold transition-colors duration-150 ${
            previewEmpty
              ? 'bg-blue-500 text-surface hover:bg-navy-700 active:bg-navy-900'
              : 'bg-blue-50 text-navy-700 hover:bg-blue-100 active:bg-blue-100'
          }`}
        >
          {previewEmpty ? (
            <EyeOff size={20} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Eye size={20} strokeWidth={1.75} aria-hidden="true" />
          )}
          {previewEmpty ? 'Exit empty preview' : 'Preview empty slate'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1 basis-80">
          <h1 className="m-0 flex items-center gap-2 text-[30px] leading-10 font-bold text-navy-900 min-[640px]:text-[36px] min-[640px]:leading-11 min-[1280px]:text-[40px] min-[1280px]:leading-12">
            {TITLE}
            <Leaf size={28} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-green-500" />
          </h1>
          <p className="m-0 mt-1 max-w-190 text-[15px] leading-6 text-navy-700 min-[640px]:text-[17px] min-[640px]:leading-7 min-[1280px]:text-[18px]">
            {SUBTITLE}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 max-[639px]:w-full">
          <button
            type="button"
            onClick={onOpenTrash}
            className="inline-flex h-11 items-center gap-2 rounded-pill border-2 border-red-500 bg-surface px-5 text-[15px] leading-5 font-semibold text-red-500 transition-colors duration-150 hover:bg-red-50 active:bg-red-500 active:text-surface max-[639px]:flex-1 max-[639px]:justify-center"
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
            Trash
          </button>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 max-[639px]:flex-1 max-[639px]:justify-center"
          >
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Create Portfolio
          </button>
        </div>
      </div>
    </div>
  )
}

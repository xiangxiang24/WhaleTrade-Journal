import { ArrowLeft, Cloud, Download, Pencil, Plus, Sprout } from 'lucide-react'
import type { Portfolio } from '../../shared/types/portfolio'

type DetailHeaderProps = {
  portfolio: Portfolio
  /** ไม่มี transaction = ส่งออกไม่ได้ */
  canExport: boolean
  onBack: () => void
  onEdit: () => void
  onExport: () => void
  onAdd: () => void
}

// ส่วนหัว: ปุ่มกลับ / ป้าย tagline / ชื่อพอร์ต + ปุ่มแก้ / คำอธิบาย / ปุ่ม Export CSV + Add Transaction
export default function DetailHeader({ portfolio, canExport, onBack, onEdit, onExport, onAdd }: DetailHeaderProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-10 items-center gap-2 rounded-pill bg-surface px-4 text-[14px] leading-5 font-medium text-navy-700 shadow-md transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100"
      >
        <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
        Back to Portfolios
      </button>

      {portfolio.tagline && (
        <p className="m-0 mt-4 flex w-fit max-w-full items-center gap-2 rounded-pill bg-blue-100 px-4 py-1.5 text-[16px] leading-6 font-semibold text-navy-700 min-[640px]:text-[18px]">
          <Cloud size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <span className="min-w-0 truncate">{portfolio.tagline}</span>
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1 basis-80">
          <h1 className="m-0 flex flex-wrap items-center gap-x-2 text-[30px] leading-10 font-bold text-navy-900 min-[640px]:text-[36px] min-[640px]:leading-11 min-[1280px]:text-[40px] min-[1280px]:leading-12">
            <span className="min-w-0 break-words">{portfolio.name}</span>
            <Sprout size={28} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-green-500" />
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${portfolio.name} details`}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill text-navy-700 hover:bg-blue-100 active:bg-blue-100"
            >
              <Pencil size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </h1>
          {portfolio.description && (
            <p className="m-0 mt-2 max-w-190 text-[15px] leading-6 text-navy-700 min-[640px]:text-[16px]">
              {portfolio.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 max-[639px]:w-full">
          <button
            type="button"
            onClick={onExport}
            disabled={!canExport}
            className="inline-flex h-11 items-center gap-2 rounded-pill border-2 border-blue-500 bg-surface px-5 text-[15px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100 disabled:border-blue-200 disabled:text-text-muted disabled:opacity-60 max-[639px]:flex-1 max-[639px]:justify-center"
          >
            <Download size={16} strokeWidth={1.75} aria-hidden="true" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 max-[639px]:flex-1 max-[639px]:justify-center"
          >
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            Add Transaction
          </button>
        </div>
      </div>
    </div>
  )
}

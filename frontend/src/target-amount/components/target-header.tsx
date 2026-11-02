import { Calculator, Sparkles } from 'lucide-react'

// ข้อความตกแต่งคงที่ของหน้าจอ (database.md หัวข้อ 4) ยังไม่ผ่านระบบแปลภาษา
const TOOL = 'Mindful projection tool'
const TITLE = 'Target Calculator'
const SUBTITLE = 'Plan gently. A little every month goes a long way toward your quiet sanctuary.'
const MODEL = 'Model: Compounded Annualized Growth'

// ส่วนหัว: ป้ายเครื่องมือ / ชื่อหน้า + คำโปรย (ซ้าย) / ป้ายโมเดลคำนวณ (ขวา)
export default function TargetHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0 flex-1 basis-80">
        <p className="m-0 flex items-center gap-2 text-[11px] leading-4 font-semibold tracking-[0.08em] text-navy-700 uppercase">
          <Calculator size={14} strokeWidth={1.75} aria-hidden="true" />
          {TOOL}
        </p>
        <h1 className="m-0 mt-1 flex items-center gap-2 text-[30px] leading-10 font-bold text-navy-900 min-[640px]:text-[36px] min-[640px]:leading-11 min-[1280px]:text-[40px] min-[1280px]:leading-12">
          {TITLE}
          <Sparkles size={28} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-navy-700" />
        </h1>
        <p className="m-0 mt-1 max-w-190 text-[15px] leading-6 text-navy-700 min-[640px]:text-[17px] min-[640px]:leading-7 min-[1280px]:text-[18px]">
          {SUBTITLE}
        </p>
      </div>
      <p className="m-0 inline-flex items-center gap-2 rounded-pill bg-blue-50 px-4 py-2 text-[12px] leading-4 font-semibold text-navy-700">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-pill bg-navy-700" />
        {MODEL}
      </p>
    </div>
  )
}

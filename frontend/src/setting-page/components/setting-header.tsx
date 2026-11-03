import { Cog, SlidersHorizontal } from 'lucide-react'

// ข้อความตกแต่งคงที่ของหน้าจอ (ยังไม่ผ่านระบบแปลภาษา)
const TAG = 'Peaceful Preferences'
const TITLE = 'Settings'
const SUBTITLE = 'Make this space feel just right for you. A quiet haven for your dividend growth.'

// ส่วนหัว: ป้ายหมวด / ชื่อหน้า + ไอคอนตกแต่ง / คำโปรย
export default function SettingHeader() {
  return (
    <div>
      <p className="m-0 inline-flex items-center gap-2 rounded-pill bg-blue-100 px-3 py-1 text-[12px] leading-5 font-semibold text-navy-700">
        <SlidersHorizontal size={14} strokeWidth={1.75} aria-hidden="true" />
        {TAG}
      </p>
      <h1 className="m-0 mt-3 flex items-center gap-2 text-[30px] leading-10 font-bold text-navy-900 min-[640px]:text-[36px] min-[640px]:leading-11 min-[1280px]:text-[40px] min-[1280px]:leading-12">
        {TITLE}
        <Cog size={28} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-navy-700" />
      </h1>
      <p className="m-0 mt-1 max-w-190 text-[15px] leading-6 text-navy-700 min-[640px]:text-[17px] min-[640px]:leading-7 min-[1280px]:text-[18px]">
        {SUBTITLE}
      </p>
    </div>
  )
}

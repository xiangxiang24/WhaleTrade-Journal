import type { LucideIcon } from 'lucide-react'

type SidebarItemProps = {
  label: string
  icon: LucideIcon
  active: boolean
  /** จำนวนที่แสดงเป็น badge สีแดง (เช่น Reminder ที่ถึงเวลาแล้ว) ไม่แสดงเมื่อเป็น 0 */
  badge?: number
  onClick: () => void
}

// เมนู 1 รายการ: แบบเต็ม = ไอคอน + ข้อความ, แบบไอคอน (หน้าต่างกว้าง < 1280) = ปุ่ม 44 × 44 + tooltip ทางขวา
export default function SidebarItem({ label, icon: Icon, active, badge = 0, onClick }: SidebarItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        className={`group relative flex h-10 w-full [--bounce-scale:1.03] [--press-scale:0.97] max-[1279px]:[--bounce-scale:1.1] max-[1279px]:[--press-scale:0.92] items-center gap-5 rounded-md px-3 text-left text-[16px] leading-6 font-medium transition-colors duration-150 short:h-9 max-[1279px]:size-11 max-[1279px]:short:h-11 max-[1279px]:justify-center max-[1279px]:px-0 ${
          active
            ? 'bg-blue-100 text-navy-700'
            : 'text-navy-900 hover:bg-blue-50 hover:text-blue-500'
        }`}
      >
        <Icon size={22} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
        <span className="max-[1279px]:hidden">{label}</span>

        {badge > 0 && (
          <span className="ml-auto flex h-4.5 min-w-4.5 items-center justify-center rounded-pill bg-red-500 px-1 text-[11px] leading-none font-bold text-surface max-[1279px]:absolute max-[1279px]:top-1 max-[1279px]:right-1 max-[1279px]:ml-0">
            {badge > 99 ? '99+' : badge}
          </span>
        )}

        {/* tooltip ชื่อเมนูทางขวา (เฉพาะแบบไอคอน หน่วง 300ms) */}
        <span
          role="tooltip"
          className="pointer-events-none absolute top-1/2 left-full z-10 ml-3 hidden -translate-y-1/2 rounded-sm bg-navy-900 px-2.5 py-1 text-[12px] leading-4 font-medium whitespace-nowrap text-surface opacity-0 shadow-md transition-opacity duration-150 max-[1279px]:block max-[1279px]:group-hover:opacity-100 max-[1279px]:group-hover:delay-300 max-[1279px]:group-focus-visible:opacity-100"
        >
          {label}
        </span>
      </button>
    </li>
  )
}

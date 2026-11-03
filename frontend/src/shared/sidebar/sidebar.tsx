import { Bell, LogOut, NotebookPen, Settings, SquareBookmark, Target, Trash2, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import banner from '../../assets/Banner.png'
import logo from '../../assets/Logo.png'
import Avatar from '../avatar/avatar'
import type { SidebarKey, SidebarUser } from '../types/sidebar'
import { useI18n } from '../i18n/use-i18n'
import SidebarItem from './sidebar-item'

type SidebarProps = {
  /** เมนูที่กำลังเลือก (หน้า Write Note ใช้ 'my-journals', หน้า Portfolio Detail ใช้ 'portfolio') */
  active: SidebarKey
  user: SidebarUser
  /** จำนวน Reminder ที่ถึงเวลาแล้ว แสดงเป็น badge ที่เมนู Reminder */
  reminderBadge?: number
  onNavigate: (key: SidebarKey) => void
  onLogout: () => void
}

type MenuSection = {
  label: string
  items: { key: SidebarKey; label: string; icon: LucideIcon }[]
}

// ลำดับเมนูตรงดีไซน์ (design rules หัวข้อ 6.2)
const SECTIONS: MenuSection[] = [
  {
    label: 'Main',
    items: [
      { key: 'my-journals', label: 'My Journals', icon: NotebookPen },
      { key: 'portfolio', label: 'Portfolio', icon: Wallet },
      { key: 'reminder', label: 'Reminder', icon: Bell },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { key: 'saved-plan', label: 'Saved Plan', icon: SquareBookmark },
      { key: 'target-amount', label: 'Target Amount', icon: Target },
    ],
  },
  {
    label: 'Settings',
    items: [
      { key: 'trash', label: 'Trash', icon: Trash2 },
      { key: 'setting', label: 'Setting', icon: Settings },
    ],
  },
]

// ป้ายใต้ชื่อผู้ใช้เป็นข้อความคงที่ของหน้าจอ (database.md หัวข้อ 4)
const USER_LABEL = 'Dividend Haven'

// Sidebar ที่ใช้ทุกหน้าในแอป: แบบเต็ม (กว้างตั้งแต่ 1280) / แบบไอคอน (< 1280) / ซ่อนภาพประกอบเมื่อหน้าต่างเตี้ย
// ตัว component สูงเต็มพื้นที่ของ parent (parent กำหนดระยะห่างขอบหน้าต่าง 16)
export default function Sidebar({ active, user, reminderBadge, onNavigate, onLogout }: SidebarProps) {
  const { t } = useI18n()
  return (
    <aside
      aria-label={t('Sidebar')}
      className="flex h-full w-62 shrink-0 flex-col rounded-[28px] bg-surface px-5 py-6 shadow-md transition-[width] duration-200 short:py-4 max-[1279px]:w-19 max-[1279px]:items-center max-[1279px]:px-0 max-[1279px]:py-4"
    >
      {/* โลโก้ + ชื่อแอป (แบบไอคอนเหลือแต่ภาพวาฬ) */}
      <div className="flex items-center gap-1 max-[1279px]:justify-center">
        <img
          className="h-24 w-auto shrink-0 short:h-16 max-[1279px]:h-9 max-[1279px]:short:h-9"
          src={logo}
          alt=""
        />
        <p className="m-0 text-center text-[18px] leading-6 font-bold text-navy-900 short:text-[16px] short:leading-5 max-[1279px]:hidden">
          {t('Whale Trade Journal')}
        </p>
      </div>

      <nav aria-label={t('Main navigation')} className="mt-2 max-[1279px]:w-full max-[1279px]:px-4">
        {SECTIONS.map((section, index) => (
          <div key={section.label}>
            {index > 0 && <hr className="my-5 border-0 border-t border-blue-200/60 short:my-2 max-[1279px]:my-3" />}
            <p className="m-0 mb-2 text-[17px] leading-6 font-semibold text-navy-700 short:mb-1 max-[1279px]:hidden">
              {t(section.label)}
            </p>
            <ul className="m-0 flex list-none flex-col gap-3 p-0 short:gap-1 max-[1279px]:items-center max-[1279px]:gap-1">
              {section.items.map(({ key, label, icon }) => (
                <SidebarItem
                  key={key}
                  label={t(label)}
                  icon={icon}
                  active={key === active}
                  badge={key === 'reminder' ? reminderBadge : undefined}
                  onClick={() => onNavigate(key)}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* ภาพประกอบกินที่ว่างที่เหลือและย่อตามความสูง: ซ่อนในแบบไอคอนและเมื่อหน้าต่างเตี้ย (< 940) */}
      <div className="min-h-0 flex-1 pt-6 snug:hidden max-[1279px]:hidden">
        <img className="h-full w-full rounded-xl object-contain" src={banner} alt="" />
      </div>

      {/* ผู้ใช้ + ปุ่มออกจากระบบ ชิดล่างสุดเสมอ (แบบไอคอนเรียงเป็นแนวตั้ง) */}
      <div className="mt-auto flex items-center gap-3 pt-4 short:pt-2 max-[1279px]:flex-col max-[1279px]:gap-2">
        <Avatar src={user.avatarUrl} className="size-9" />
        <div className="min-w-0 flex-1 max-[1279px]:hidden">
          <p className="m-0 truncate text-[15px] leading-5 font-semibold text-navy-900">{user.displayName}</p>
          <p className="m-0 truncate text-[12px] leading-4 text-text-muted">{t(USER_LABEL)}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label={t('Log out')}
          className="group flex size-8 shrink-0 items-center justify-center rounded-pill text-navy-700 transition-colors duration-150 hover:text-red-500 [--bounce-scale:1.3] [--press-scale:0.9]"
        >
          {/* hover: ไอคอนขยาย เส้นหนาขึ้นและเป็นสีแดง (ไม่มีพื้นหลัง) */}
          <LogOut
            size={20}
            strokeWidth={1.75}
            aria-hidden="true"
            className="transition-[stroke-width] duration-150 group-hover:[stroke-width:2.5]"
          />
        </button>
      </div>
    </aside>
  )
}

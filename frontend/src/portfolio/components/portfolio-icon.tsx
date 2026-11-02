import { Sprout } from 'lucide-react'
import type { PortfolioIconKey } from '../../shared/types/portfolio'
import { PORTFOLIO_ICONS } from '../types/portfolio-icons'

type PortfolioIconProps = {
  icon: PortfolioIconKey
  /** ขนาดของวงกลม (class ของ Tailwind เช่น size-12) */
  className?: string
  iconSize?: number
}

// ไอคอนในวงกลมพื้นฟ้าอ่อน (ตกแต่งเท่านั้น ชื่อพอร์ตแสดงเป็นข้อความอยู่ข้างๆ เสมอ)
export default function PortfolioIcon({ icon, className = 'size-12', iconSize = 22 }: PortfolioIconProps) {
  const Icon = PORTFOLIO_ICONS.find((item) => item.key === icon)?.icon ?? Sprout
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-pill bg-blue-100 text-navy-700 ${className}`}
    >
      <Icon size={iconSize} strokeWidth={1.75} />
    </span>
  )
}

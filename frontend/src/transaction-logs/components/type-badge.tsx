import { CircleMinus, CirclePlus, Coins } from 'lucide-react'
import type { TransactionType } from '../../shared/types/transaction'

const STYLE = {
  buy: { label: 'Buy', Icon: CirclePlus, tint: 'bg-blue-100', icon: 'text-blue-500' },
  sell: { label: 'Sell', Icon: CircleMinus, tint: 'bg-red-50', icon: 'text-red-500' },
  dividend: { label: 'Dividend', Icon: Coins, tint: 'bg-green-50', icon: 'text-green-500' },
} as const

// ป้ายประเภท: สี + ไอคอน + ข้อความ (ไม่สื่อด้วยสีอย่างเดียว) ข้อความ navy-900 ผ่านความคมชัดทุกพื้น
export default function TypeBadge({ type }: { type: TransactionType }) {
  const { label, Icon, tint, icon } = STYLE[type]
  return (
    <span
      className={`inline-flex h-7 items-center gap-1.5 rounded-pill px-3 text-[13px] leading-5 font-semibold text-navy-900 ${tint}`}
    >
      <Icon size={14} strokeWidth={1.75} aria-hidden="true" className={icon} />
      {label}
    </span>
  )
}

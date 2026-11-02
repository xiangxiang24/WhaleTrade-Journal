import { Anchor, CookingPot, Gem, Landmark, ShoppingBag, Sprout, type LucideIcon } from 'lucide-react'
import type { PortfolioIconKey } from '../../shared/types/portfolio'

// ชุดไอคอนพอร์ตที่แอปมี (คีย์ตรงกับ Portfolio.icon) ใช้ทั้งการ์ดและตัวเลือกในฟอร์ม
export const PORTFOLIO_ICONS: { key: PortfolioIconKey; label: string; icon: LucideIcon }[] = [
  { key: 'leaf', label: 'Sprout', icon: Sprout },
  { key: 'bag', label: 'Bag', icon: ShoppingBag },
  { key: 'pot', label: 'Pot', icon: CookingPot },
  { key: 'anchor', label: 'Anchor', icon: Anchor },
  { key: 'gem', label: 'Gem', icon: Gem },
  { key: 'landmark', label: 'Landmark', icon: Landmark },
]

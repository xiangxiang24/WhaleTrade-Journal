import { Plus } from 'lucide-react'
import banner from '../../assets/Banner.png'
import type { Portfolio } from '../../shared/types/portfolio'
import type { PortfolioLoadStatus } from '../types/portfolio'
import PortfolioCard from './portfolio-card'
import { useI18n } from '../../shared/i18n/use-i18n'

type PortfolioGridProps = {
  status: PortfolioLoadStatus
  portfolios: Portfolio[]
  /** true = แสดงหน้าตา Empty state จำลอง แม้มีพอร์ตอยู่ (ปุ่ม Preview empty slate) */
  previewEmpty: boolean
  timeZone: string
  onOpen: (id: number) => void
  onEdit: (portfolio: Portfolio) => void
  onTrash: (portfolio: Portfolio) => void
  onCreate: () => void
  onRetry: () => void
}

// คอลัมน์ปรับเองตามความกว้าง (การ์ดกว้างอย่างน้อย 300) ช่องว่าง 16 / 24 ตามขนาดหน้าต่าง
const GRID =
  'grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4 min-[1280px]:gap-6'

const PRIMARY_BUTTON =
  'inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900'

// ใต้การ์ดต้องเผื่อที่ให้เงา/การ์ดลอยตอน hover ไม่โดนตัดโดยพื้นที่เลื่อน
function Message({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-4xl bg-surface px-6 py-12 text-center shadow-md">
      <img className="h-40 w-auto min-[640px]:h-48" src={banner} alt="" />
      <p className="m-0 mt-4 text-[18px] leading-7 font-bold text-navy-900">{title}</p>
      <p className="m-0 mt-1 max-w-110 text-[14px] leading-6 text-text-muted">{description}</p>
      <div className="mt-6">{action}</div>
    </div>
  )
}

// กริดการ์ดพอร์ต + สถานะ กำลังโหลด / ผิดพลาด / ยังไม่มีพอร์ต (Empty state)
export default function PortfolioGrid({
  status,
  portfolios,
  previewEmpty,
  timeZone,
  onOpen,
  onEdit,
  onTrash,
  onCreate,
  onRetry,
}: PortfolioGridProps) {
  const { t } = useI18n()
  if (status === 'loading') {
    return (
      <div className={GRID} role="status" aria-label={t('Loading your portfolios')}>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-90 animate-pulse rounded-4xl bg-blue-100 motion-reduce:animate-none" />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Message
        title={t('Could not load your portfolios')}
        description={t('Something went wrong. Please try again.')}
        action={
          <button type="button" onClick={onRetry} className={PRIMARY_BUTTON}>
            {t('Try again')}
          </button>
        }
      />
    )
  }

  if (previewEmpty || portfolios.length === 0) {
    return (
      <Message
        title={t('Your garden is waiting for its first seed')}
        description={t('Create your first portfolio to set a yearly goal and record every DCA in one calm place.')}
        action={
          <button type="button" onClick={onCreate} className={PRIMARY_BUTTON}>
            <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
            {t('Create your first portfolio')}
          </button>
        }
      />
    )
  }

  return (
    <ul className={`${GRID} m-0 list-none p-0`}>
      {portfolios.map((portfolio) => (
        <li key={portfolio.id} className="min-w-0">
          <PortfolioCard
            portfolio={portfolio}
            timeZone={timeZone}
            onOpen={onOpen}
            onEdit={onEdit}
            onTrash={onTrash}
          />
        </li>
      ))}
    </ul>
  )
}

import { Search, Wallet, NotebookPen } from 'lucide-react'
import banner from '../../assets/Banner.png'
import type { TrashedNote } from '../../shared/types/journal-note'
import type { TrashedPortfolio } from '../../shared/types/portfolio'
import { useI18n } from '../../shared/i18n/use-i18n'
import type { TrashLoadStatus, TrashTab } from '../types/trash'
import TrashedNoteCard from './trashed-note-card'
import TrashedPortfolioCard from './trashed-portfolio-card'

type TrashListProps = {
  tab: TrashTab
  status: TrashLoadStatus
  /** รายการของแท็บที่เปิดอยู่หลังกรองด้วยคำค้น */
  notes: TrashedNote[]
  portfolios: TrashedPortfolio[]
  /** จำนวนรายการจริงของแท็บ (ก่อนค้นหา) แยกว่าว่างจริง หรือแค่ค้นไม่เจอ */
  total: number
  query: string
  timeZone: string
  onOpenNote: (note: TrashedNote) => void
  onRestoreNote: (note: TrashedNote) => void
  onDeleteNote: (note: TrashedNote) => void
  onRestorePortfolio: (portfolio: TrashedPortfolio) => void
  onDeletePortfolio: (portfolio: TrashedPortfolio) => void
  onGoJournals: () => void
  onGoPortfolio: () => void
  onRetry: () => void
}

// คอลัมน์ปรับเองตามความกว้าง (การ์ดกว้างอย่างน้อย 300 → 1 / 2 / 3 / 4 คอลัมน์) ช่องว่าง 16 / 24
const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4 min-[1280px]:gap-6'

const PRIMARY_BUTTON =
  'inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900'

function Message({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-4xl bg-surface px-6 py-12 text-center shadow-md">
      <img className="h-40 w-auto min-[640px]:h-48" src={banner} alt="" />
      <p className="m-0 mt-4 text-[18px] leading-7 font-bold text-navy-900">{title}</p>
      <p className="m-0 mt-1 max-w-110 text-[14px] leading-6 text-text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// รายการของแท็บที่เปิดอยู่ + สถานะ กำลังโหลด / ผิดพลาด / ถังขยะว่าง / ค้นหาไม่เจอ
export default function TrashList({
  tab,
  status,
  notes,
  portfolios,
  total,
  query,
  timeZone,
  onOpenNote,
  onRestoreNote,
  onDeleteNote,
  onRestorePortfolio,
  onDeletePortfolio,
  onGoJournals,
  onGoPortfolio,
  onRetry,
}: TrashListProps) {
  const { t } = useI18n()

  if (status === 'loading') {
    return (
      <div className={GRID} role="status" aria-label={t('Loading your trash')}>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-60 animate-pulse rounded-3xl bg-blue-100 motion-reduce:animate-none" />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Message
        title={t('Could not load your trash')}
        description={t('Something went wrong. Please try again.')}
        action={
          <button type="button" onClick={onRetry} className={PRIMARY_BUTTON}>
            {t('Try again')}
          </button>
        }
      />
    )
  }

  if (total === 0) {
    return tab === 'journals' ? (
      <Message
        title={t('No journals in the trash')}
        description={t('Journals you delete will wait here until you restore or delete them for good.')}
        action={
          <button type="button" onClick={onGoJournals} className={PRIMARY_BUTTON}>
            <NotebookPen size={18} strokeWidth={1.75} aria-hidden="true" />
            {t('Go to My Journals')}
          </button>
        }
      />
    ) : (
      <Message
        title={t('No portfolios in the trash')}
        description={t('Portfolios you delete will wait here until you restore or delete them for good.')}
        action={
          <button type="button" onClick={onGoPortfolio} className={PRIMARY_BUTTON}>
            <Wallet size={18} strokeWidth={1.75} aria-hidden="true" />
            {t('Go to Portfolio')}
          </button>
        }
      />
    )
  }

  const shown = tab === 'journals' ? notes.length : portfolios.length
  if (shown === 0) {
    return (
      <div role="status" className="flex flex-col items-center rounded-4xl bg-surface px-6 py-12 text-center shadow-md">
        <Search size={28} strokeWidth={1.75} aria-hidden="true" className="text-blue-500" />
        <p className="m-0 mt-3 text-[18px] leading-7 font-bold text-navy-900">{t('No matches')}</p>
        <p className="m-0 mt-1 max-w-110 text-[14px] leading-6 break-words text-text-muted">
          {t('Nothing in this tab matches “{query}”.', { query: query.trim() })}
        </p>
      </div>
    )
  }

  return (
    <ul className={`${GRID} m-0 list-none p-0`}>
      {tab === 'journals'
        ? notes.map((note) => (
            <li key={note.id} className="min-w-0">
              <TrashedNoteCard
                note={note}
                timeZone={timeZone}
                onOpen={onOpenNote}
                onRestore={onRestoreNote}
                onDelete={onDeleteNote}
              />
            </li>
          ))
        : portfolios.map((portfolio) => (
            <li key={portfolio.id} className="min-w-0">
              <TrashedPortfolioCard
                portfolio={portfolio}
                timeZone={timeZone}
                onRestore={onRestorePortfolio}
                onDelete={onDeletePortfolio}
              />
            </li>
          ))}
    </ul>
  )
}

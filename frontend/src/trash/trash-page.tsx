import { useCallback, useState } from 'react'
import AppLayout from '../shared/app-shell/app-layout'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import type { TrashedNote } from '../shared/types/journal-note'
import type { TrashedPortfolio } from '../shared/types/portfolio'
import type { SidebarKey, SidebarUser } from '../shared/types/sidebar'
import PortfolioToastView from '../portfolio/components/portfolio-toast'
import TrashHeader from './components/trash-header'
import TrashList from './components/trash-list'
import TrashNotice from './components/trash-notice'
import TrashToolbar from './components/trash-toolbar'
import DeleteForeverModal from './modals/delete-forever-modal'
import EmptyTrashModal from './modals/empty-trash-modal'
import NoteViewModal from './modals/note-view-modal'
import { matchesQuery, type PurgeTarget, type TrashTab, type TrashToast } from './types/trash'
import { useTrash } from './types/use-trash'
import { useI18n } from '../shared/i18n/use-i18n'

type TrashPageProps = {
  user: SidebarUser
  /** จำนวน Reminder ที่ถึงเวลาแล้ว (badge ที่ Sidebar) */
  reminderBadge?: number
  /** เขตเวลาของผู้ใช้ (รหัส IANA จาก User.timezone) ใช้แปลงวันที่ */
  timeZone?: string
  onNavigate?: (key: SidebarKey) => void
  onLogout?: () => void
}

const DEFAULT_TITLE = 'Today Journal'

// หน้า Trash: โน้ตและพอร์ตที่ลบไว้ (2 แท็บ) กู้คืนได้ทันที ลบถาวรต้องยืนยัน ไม่มีการลบอัตโนมัติ
export default function TrashPage({ user, reminderBadge, timeZone = 'Asia/Bangkok', onNavigate, onLogout }: TrashPageProps) {
  const { t } = useI18n()
  const trash = useTrash()
  const { leaving, leaveTo } = usePageLeave()
  const [tab, setTab] = useState<TrashTab>('journals')
  const [query, setQuery] = useState('')
  const [viewNote, setViewNote] = useState<TrashedNote | null>(null)
  const [purgeTarget, setPurgeTarget] = useState<PurgeTarget | null>(null)
  const [emptyTab, setEmptyTab] = useState<TrashTab | null>(null)
  const [toast, setToast] = useState<TrashToast | null>(null)

  const showToast = useCallback((message: string) => setToast({ id: Date.now(), message }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  const noteTitle = (note: TrashedNote) => note.title?.trim() || t(DEFAULT_TITLE)

  // ค้นหาเฉพาะแท็บที่เปิดอยู่ (ตามหัวข้อโน้ต / ชื่อพอร์ต)
  const visibleNotes = tab === 'journals' ? trash.notes.filter((note) => matchesQuery(noteTitle(note), query)) : trash.notes
  const visiblePortfolios =
    tab === 'portfolios' ? trash.portfolios.filter((portfolio) => matchesQuery(portfolio.name, query)) : trash.portfolios
  const total = tab === 'journals' ? trash.notes.length : trash.portfolios.length
  const ready = trash.status === 'ready'

  function changeTab(next: TrashTab) {
    setTab(next)
    setQuery('')
  }

  async function restoreNote(note: TrashedNote) {
    await trash.restoreNote(note.id)
    showToast(t('“{name}” restored to My Journals', { name: noteTitle(note) }))
  }

  async function restorePortfolio(portfolio: TrashedPortfolio) {
    await trash.restorePortfolio(portfolio.id)
    showToast(t('“{name}” restored to Portfolio', { name: portfolio.name }))
  }

  // ปุ่มกู้คืนบนการ์ด ไม่มีกล่องยืนยัน ถ้าล้มเหลวให้แจ้งทาง toast
  const quickRestore = async (action: () => Promise<void>) => {
    try {
      await action()
    } catch (caught) {
      showToast(t(caught instanceof Error ? caught.message : 'Could not restore this item. Please try again.'))
    }
  }

  async function purge(target: PurgeTarget) {
    if (target.kind === 'journal') {
      await trash.purgeNote(target.note.id)
      showToast(t('“{name}” deleted forever', { name: noteTitle(target.note) }))
    } else {
      await trash.purgePortfolio(target.portfolio.id)
      showToast(t('“{name}” deleted forever', { name: target.portfolio.name }))
    }
  }

  async function empty(which: TrashTab) {
    if (which === 'journals') await trash.emptyNotes()
    else await trash.emptyPortfolios()
    showToast(which === 'journals' ? t('Journals trash emptied') : t('Portfolios trash emptied'))
  }

  return (
    <AppLayout
      active="trash"
      user={user}
      reminderBadge={reminderBadge}
      onNavigate={(key) => {
        if (key !== 'trash') leaveTo(() => onNavigate?.(key))
      }}
      onLogout={() => onLogout?.()}
    >
      <>
        <div className={`pt-2 pb-6 ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
          <div className="animate-fade-up motion-reduce:animate-none">
            <TrashHeader count={ready ? trash.notes.length + trash.portfolios.length : null} />
          </div>

          <div className="mt-5 flex animate-fade-up flex-col gap-4 px-1 [animation-delay:60ms] motion-reduce:animate-none">
            <TrashNotice />
            <TrashToolbar
              tab={tab}
              onTabChange={changeTab}
              journalCount={trash.notes.length}
              portfolioCount={trash.portfolios.length}
              query={query}
              onQueryChange={setQuery}
              canEmpty={ready && total > 0}
              onEmpty={() => setEmptyTab(tab)}
            />
          </div>

          <section
            aria-label={tab === 'journals' ? t('Deleted journals') : t('Deleted portfolios')}
            className="mt-5 animate-fade-up px-1 pb-2 [animation-delay:120ms] motion-reduce:animate-none"
          >
            <TrashList
              tab={tab}
              status={trash.status}
              notes={visibleNotes}
              portfolios={visiblePortfolios}
              total={total}
              query={query}
              timeZone={timeZone}
              onOpenNote={setViewNote}
              onRestoreNote={(note) => void quickRestore(() => restoreNote(note))}
              onDeleteNote={(note) => setPurgeTarget({ kind: 'journal', note })}
              onRestorePortfolio={(portfolio) => void quickRestore(() => restorePortfolio(portfolio))}
              onDeletePortfolio={(portfolio) => setPurgeTarget({ kind: 'portfolio', portfolio })}
              onGoJournals={() => leaveTo(() => onNavigate?.('my-journals'))}
              onGoPortfolio={() => leaveTo(() => onNavigate?.('portfolio'))}
              onRetry={trash.reload}
            />
          </section>
        </div>

        {/* modal และ toast อยู่นอก wrapper ที่มี transform เพื่อให้ position: fixed อ้างอิงทั้งหน้าต่าง */}
        <NoteViewModal
          note={viewNote}
          timeZone={timeZone}
          onRestore={restoreNote}
          onDelete={(note) => setPurgeTarget({ kind: 'journal', note })}
          onClose={() => setViewNote(null)}
        />
        <DeleteForeverModal target={purgeTarget} onConfirm={purge} onClose={() => setPurgeTarget(null)} />
        <EmptyTrashModal
          tab={emptyTab}
          count={emptyTab === 'journals' ? trash.notes.length : trash.portfolios.length}
          onConfirm={empty}
          onClose={() => setEmptyTab(null)}
        />
        <PortfolioToastView toast={toast} onUndo={() => undefined} onDismiss={dismissToast} />
      </>
    </AppLayout>
  )
}

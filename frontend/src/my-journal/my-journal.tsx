import { useMemo, useState } from 'react'
import AppLayout from '../shared/app-shell/app-layout'
import { EMOTIONS } from '../shared/emotion/emotions'
import { contentToPlainText } from '../shared/note-editor/content'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import type { SidebarKey, SidebarUser } from '../shared/types/sidebar'
import JournalHeader from './components/journal-header'
import JournalList from './components/journal-list'
import JournalToolbar from './components/journal-toolbar'
import MoodFilter from './components/mood-filter'
import NewNoteModal from './modals/new-note-modal'
import type { MoodFilterValue } from './types/journal'
import { useJournalNotes } from './types/use-journal-notes'
import { useI18n } from '../shared/i18n/use-i18n'

type MyJournalProps = {
  user: SidebarUser
  /** จำนวน Reminder ที่ถึงเวลาแล้ว (badge ที่ Sidebar) */
  reminderBadge?: number
  /** เขตเวลาของผู้ใช้ (รหัส IANA จาก User.timezone) ใช้แปลงวันที่บนการ์ด */
  timeZone?: string
  /** ผลตอบแทนปันผลเฉลี่ยที่แสดงในป้าย (ยังเป็นค่าจำลอง ต่อ backend ภายหลัง) */
  dividendYield?: string
  onNavigate?: (key: SidebarKey) => void
  onLogout?: () => void
  onOpenNote?: (id: number) => void
}

// หน้า My Journals (หน้าแรกหลังเข้าสู่ระบบ): ส่วนหัว + ค้นหา/กรองอารมณ์ + ไทม์ไลน์การ์ดโน้ต (ใหม่ → เก่า)
export default function MyJournal({
  user,
  reminderBadge,
  timeZone = 'Asia/Bangkok',
  dividendYield = '6.84%',
  onNavigate,
  onLogout,
  onOpenNote,
}: MyJournalProps) {
  const { t } = useI18n()
  const { notes, status, reload, addNote } = useJournalNotes()
  const [newNoteOpen, setNewNoteOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [mood, setMood] = useState<MoodFilterValue>('all')
  const { leaving, leaveTo } = usePageLeave()

  // จำนวนในชิป: ทั้งหมดและแยกตามอารมณ์ (ไม่ขึ้นกับคำค้นหา)
  const counts = useMemo(() => {
    const result = { all: notes.length } as Record<MoodFilterValue, number>
    for (const { id } of EMOTIONS) result[id] = notes.filter((note) => note.emotion === id).length
    result.none = notes.filter((note) => note.emotion === null).length
    return result
  }, [notes])

  // กรองด้วยอารมณ์ + ค้นหาใน title/content (ไม่สนตัวพิมพ์ใหญ่เล็ก) แล้วเรียงใหม่ → เก่า
  const visibleNotes = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return notes
      .filter((note) => mood === 'all' || (mood === 'none' ? note.emotion === null : note.emotion === mood))
      .filter(
        (note) =>
          !keyword ||
          (note.title ?? '').toLowerCase().includes(keyword) ||
          contentToPlainText(note.content).toLowerCase().includes(keyword),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [notes, mood, query])

  function clearFilters() {
    setQuery('')
    setMood('all')
  }

  return (
    <AppLayout
      active="my-journals"
      user={user}
      reminderBadge={reminderBadge}
      onNavigate={(key) => {
        if (key !== 'my-journals') leaveTo(() => onNavigate?.(key))
      }}
      onLogout={() => onLogout?.()}
    >
      <>
        {/* เนื้อหาเข้าด้วยการลอยขึ้นทีละส่วน ออกด้วยการลอยขึ้นและจางหาย (Sidebar/TopBar อยู่นิ่ง) */}
        <div className={`pb-6 ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
          <div className="animate-fade-up motion-reduce:animate-none">
            <JournalHeader />
          </div>

          <section
            aria-label={t('Search and filter')}
            className="mt-6 animate-fade-up rounded-xl bg-surface p-4 shadow-sm [animation-delay:80ms] min-[640px]:mt-8 motion-reduce:animate-none"
          >
            <JournalToolbar
              query={query}
              onQueryChange={setQuery}
              dividendYield={dividendYield}
              onNewNote={() => setNewNoteOpen(true)}
            />
            <div className="mt-4">
              <MoodFilter value={mood} counts={counts} onChange={setMood} />
            </div>
          </section>

          <section
            aria-label={t('Journal notes')}
            className="mt-8 animate-fade-up [animation-delay:160ms] min-[640px]:mt-10 motion-reduce:animate-none"
          >
            <JournalList
              status={status}
              notes={visibleNotes}
              totalCount={notes.length}
              timeZone={timeZone}
              onOpenNote={(id) => leaveTo(() => onOpenNote?.(id))}
              onNewNote={() => setNewNoteOpen(true)}
              onClearFilters={clearFilters}
              onRetry={reload}
            />
          </section>
        </div>

        {/* modal อยู่นอก wrapper ที่มี transform เพื่อให้ position: fixed อ้างอิงทั้งหน้าต่าง */}
        <NewNoteModal
          open={newNoteOpen}
          onSubmit={addNote}
          onClose={() => setNewNoteOpen(false)}
        />
      </>
    </AppLayout>
  )
}

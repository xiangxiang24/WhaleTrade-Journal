import { useState, type FormEvent } from 'react'
import logo from '../assets/Logo.png'
import AppLayout from '../shared/app-shell/app-layout'
import { isContentEmpty } from '../shared/note-editor/content'
import { usePageLeave } from '../shared/hooks/use-page-leave'
import type { SidebarKey, SidebarUser } from '../shared/types/sidebar'
import BackButton from './components/back-button'
import EditorFooter from './components/editor-footer'
import EntryFields from './components/entry-fields'
import JournalingHeader from './components/journaling-header'
import MoodSection from './components/mood-section'
import DeleteJournalModal from './modals/delete-journal-modal'
import { useJournalEditor } from './types/use-journal-editor'

type JournalingProps = {
  /** โน้ตที่เปิดอยู่ */
  noteId: number
  user: SidebarUser
  /** จำนวน Reminder ที่ถึงเวลาแล้ว (badge ที่ Sidebar) */
  reminderBadge?: number
  onNavigate?: (key: SidebarKey) => void
  onLogout?: () => void
  /** กลับหน้า My Journals (ปุ่ม Back to Journals และ Cancel) */
  onBack?: () => void
  /** ลบโน้ตสำเร็จแล้ว ให้ผู้เรียกพากลับหน้า My Journals */
  onDeleted?: () => void
}

// หน้า Journaling: เขียน/ดู/แก้โน้ต 1 เล่ม (เลือกอารมณ์ + TITLE + REFLECTIVE THOUGHTS) พร้อมบันทึกร่างอัตโนมัติ
export default function Journaling({
  noteId,
  user,
  reminderBadge,
  onNavigate,
  onLogout,
  onBack,
  onDeleted,
}: JournalingProps) {
  const editor = useJournalEditor(noteId)
  const [contentError, setContentError] = useState<string>()
  const [saveError, setSaveError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const { leaving, leaveTo } = usePageLeave()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (saving || !editor.dirty) return
    if (isContentEmpty(editor.values.content)) {
      setContentError('Please write a few thoughts before saving.')
      return
    }
    setContentError(undefined)
    setSaveError(undefined)
    setSaving(true)
    try {
      await editor.save()
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save your changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Cancel: ทิ้งการแก้ไขและลบร่าง แล้วกลับหน้ารวม (ส่วน Back to Journals จะเก็บร่างไว้กู้คืน)
  async function handleCancel() {
    await editor.discard()
    leaveTo(onBack)
  }

  function renderBody() {
    if (editor.status === 'loading') {
      return (
        <div role="status" aria-label="Loading your journal" className="mt-6 h-96 animate-pulse rounded-3xl bg-blue-100 motion-reduce:animate-none" />
      )
    }

    if (editor.status === 'not-found' || editor.status === 'error') {
      const notFound = editor.status === 'not-found'
      return (
        <div className="mt-6 flex flex-col items-center rounded-3xl bg-surface px-6 py-16 text-center shadow-sm">
          <img className="h-32 w-auto" src={logo} alt="" />
          <p className="m-0 mt-4 text-[17px] leading-6 font-semibold text-navy-900">
            {notFound ? 'This journal no longer exists' : 'Could not load this journal'}
          </p>
          <p className="m-0 mt-1 text-[14px] leading-5 text-text-muted">
            {notFound ? 'It may have been deleted.' : 'Something went wrong. Please try again.'}
          </p>
          <div className="mt-5">
            {notFound ? (
              <BackButton onClick={() => leaveTo(onBack)} />
            ) : (
              <button
                type="button"
                onClick={editor.reload}
                className="inline-flex h-11 items-center rounded-pill bg-blue-500 px-6 text-[16px] font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      )
    }

    return (
      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-6 flex animate-fade-up flex-col gap-6 rounded-3xl bg-surface p-5 shadow-sm [animation-delay:100ms] min-[640px]:p-8 motion-reduce:animate-none"
      >
        <MoodSection value={editor.values.emotion} onChange={(emotion) => editor.change({ emotion })} />
        <EntryFields
          title={editor.values.title}
          content={editor.values.content}
          contentError={contentError}
          onTitleChange={(title) => editor.change({ title })}
          onContentChange={(content) => {
            editor.change({ content })
            if (contentError) setContentError(undefined)
          }}
        />
        {saveError && (
          <p role="alert" className="m-0 text-[13px] leading-5 text-red-500">
            {saveError}
          </p>
        )}
        <EditorFooter
          canSave={editor.dirty}
          saving={saving}
          onDelete={() => setDeleteOpen(true)}
          onCancel={handleCancel}
        />
      </form>
    )
  }

  return (
    <AppLayout
      active="my-journals"
      user={user}
      reminderBadge={reminderBadge}
      onNavigate={(key) => {
        if (key === 'my-journals') leaveTo(onBack)
        else leaveTo(() => onNavigate?.(key))
      }}
      onLogout={() => onLogout?.()}
    >
      <>
        {/* เนื้อหาเข้าด้วยการลอยขึ้น ออกด้วยการลอยขึ้นและจางหาย (Sidebar/TopBar อยู่นิ่ง) */}
        <div className={`pb-6 ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
          <div className="animate-fade-up motion-reduce:animate-none">
            <JournalingHeader
              draftState={editor.draftState}
              draftSavedAt={editor.draftSavedAt}
              onBack={() => leaveTo(onBack)}
            />
          </div>
          {renderBody()}
        </div>

        {/* modal อยู่นอก wrapper ที่มี transform เพื่อให้ position: fixed อ้างอิงทั้งหน้าต่าง */}
        <DeleteJournalModal
          open={deleteOpen}
          onConfirm={async () => {
            await editor.remove()
            setDeleted(true)
          }}
          onClose={() => {
            setDeleteOpen(false)
            // ลบสำเร็จแล้ว: เนื้อหาลอยออกก่อนกลับหน้า My Journals
            if (deleted) leaveTo(onDeleted)
          }}
        />
      </>
    </AppLayout>
  )
}

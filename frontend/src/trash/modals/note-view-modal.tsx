import { useEffect, useId, useState } from 'react'
import { CalendarDays, RotateCcw, Trash2, X } from 'lucide-react'
import MoodBadge from '../../shared/emotion/mood-badge'
import ModalFrame from '../../shared/modal/modal-frame'
import { contentToPlainText } from '../../shared/note-editor/content'
import type { TrashedNote } from '../../shared/types/journal-note'
import { formatNoteDate } from '../../my-journal/types/format-note-date'
import { useI18n } from '../../shared/i18n/use-i18n'

type NoteViewModalProps = {
  /** โน้ตที่เปิดอ่าน (ว่าง = ปิด) */
  note: TrashedNote | null
  timeZone: string
  /** กู้คืน (ไม่ถามยืนยัน) ถ้าไม่สำเร็จให้ throw Error */
  onRestore: (note: TrashedNote) => Promise<void>
  /** ขอลบถาวร: เรียกหลังกล่องนี้ปิดแล้ว เพื่อให้หน้าเปิดกล่องยืนยันต่อ */
  onDelete: (note: TrashedNote) => void
  onClose: () => void
}

const EXIT_MS = 200
const DEFAULT_TITLE = 'Today Journal'

function Dialog({ note, timeZone, onRestore, onDelete, onClose }: Omit<NoteViewModalProps, 'note'> & { note: TrashedNote }) {
  const { t, locale } = useI18n()
  const [closing, setClosing] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string>()
  // หลังเล่นแอนิเมชันปิดจบ ค่อยทำสิ่งนี้ต่อ (เช่น เปิดกล่องยืนยันลบถาวร)
  const [afterClose, setAfterClose] = useState<(() => void) | null>(null)
  const titleId = useId()
  const descId = useId()
  const title = note.title?.trim() || t(DEFAULT_TITLE)

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(() => {
      onClose()
      afterClose?.()
    }, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose, afterClose])

  async function handleRestore() {
    if (working) return
    setWorking(true)
    setError(undefined)
    try {
      await onRestore(note)
      setClosing(true)
    } catch (caught) {
      setError(t(caught instanceof Error ? caught.message : 'Could not restore this journal. Please try again.'))
      setWorking(false)
    }
  }

  return (
    <ModalFrame
      titleId={titleId}
      descId={descId}
      closing={closing}
      onRequestClose={() => {
        if (!working) setClosing(true)
      }}
      cardClassName="max-w-190 p-5 text-left min-[640px]:p-8"
    >
      <div className="flex items-start justify-between gap-3">
        <MoodBadge emotion={note.emotion} size="lg" />
        <button
          type="button"
          aria-label={t('Close')}
          disabled={working}
          onClick={() => setClosing(true)}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill text-navy-700 transition-colors duration-150 hover:bg-blue-100 disabled:opacity-50"
        >
          <X size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <h2 id={titleId} className="m-0 mt-4 text-[22px] leading-8 font-bold break-words text-navy-900 min-[640px]:text-[26px] min-[640px]:leading-9">
        {title}
      </h2>
      <p className="m-0 mt-1 flex items-center gap-1.5 text-[12px] leading-4 text-text-muted">
        <CalendarDays size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
        <time dateTime={note.createdAt}>{formatNoteDate(note.createdAt, timeZone, locale)}</time>
        <span aria-hidden="true">·</span>
        {t('Deleted')} <time dateTime={note.deletedAt}>{formatNoteDate(note.deletedAt, timeZone, locale)}</time>
      </p>

      {/* อ่านอย่างเดียว: ใช้ข้อความล้วน ไม่มีตัวแก้ไข */}
      <div
        id={descId}
        tabIndex={0}
        aria-label={t('Journal content (read only)')}
        className="mt-4 max-h-[min(50vh,360px)] overflow-y-auto rounded-2xl bg-blue-50 px-4 py-3 text-[15px] leading-7 break-words whitespace-pre-wrap text-navy-900 outline-none focus-visible:shadow-focus"
      >
        {contentToPlainText(note.content) || t('This journal has no text.')}
      </div>
      <p className="m-0 mt-2 text-[12px] leading-4 text-text-muted">{t('Read only. Restore this journal to edit it.')}</p>

      {error && (
        <p role="alert" className="m-0 mt-3 text-[13px] leading-5 text-navy-900">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-3 max-[479px]:flex-col-reverse">
        <button
          type="button"
          disabled={working}
          onClick={() => {
            setAfterClose(() => () => onDelete(note))
            setClosing(true)
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border-2 border-red-500 bg-surface px-6 text-[14px] leading-5 font-semibold text-red-500 transition-colors duration-150 hover:bg-red-50 active:bg-red-50 disabled:opacity-50"
        >
          <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
          {t('Delete forever')}
        </button>
        <button
          data-autofocus
          type="button"
          disabled={working}
          onClick={handleRestore}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-blue-500 px-6 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:opacity-50"
        >
          <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
          {working ? t('Restoring…') : t('Restore')}
        </button>
      </div>
    </ModalFrame>
  )
}

// อ่านโน้ตในถังขยะแบบอ่านอย่างเดียว มีปุ่มกู้คืนและลบถาวร (mount เฉพาะตอนเปิด)
export default function NoteViewModal({ note, ...props }: NoteViewModalProps) {
  return note ? <Dialog note={note} {...props} /> : null
}

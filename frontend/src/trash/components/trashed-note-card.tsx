import { CalendarDays, Trash2 } from 'lucide-react'
import MoodBadge from '../../shared/emotion/mood-badge'
import { contentToPlainText } from '../../shared/note-editor/content'
import type { TrashedNote } from '../../shared/types/journal-note'
import { formatNoteDate } from '../../my-journal/types/format-note-date'
import { useI18n } from '../../shared/i18n/use-i18n'
import CardActions from './card-actions'

type TrashedNoteCardProps = {
  note: TrashedNote
  timeZone: string
  onOpen: (note: TrashedNote) => void
  onRestore: (note: TrashedNote) => void
  onDelete: (note: TrashedNote) => void
}

const DEFAULT_TITLE = 'Today Journal'

// การ์ดโน้ตในถังขยะ: เนื้อหาจาง (กดเพื่ออ่านเต็มแบบอ่านอย่างเดียว) ปุ่มกู้คืน / ลบถาวรไม่จาง
export default function TrashedNoteCard({ note, timeZone, onOpen, onRestore, onDelete }: TrashedNoteCardProps) {
  const { t, locale } = useI18n()
  const title = note.title?.trim() || t(DEFAULT_TITLE)

  return (
    <article
      aria-label={title}
      className="flex h-full flex-col rounded-3xl border-2 border-dashed border-blue-200 bg-surface p-5 shadow-sm"
    >
      <button
        type="button"
        onClick={() => onOpen(note)}
        aria-label={t('Read {name}', { name: title })}
        className="group flex min-w-0 flex-1 flex-col rounded-2xl text-left"
        data-no-bounce
      >
        <span className="opacity-70 transition-opacity duration-200 group-hover:opacity-90">
          <MoodBadge emotion={note.emotion} />
          <span className="m-0 mt-3 block truncate text-[20px] leading-7 font-bold text-navy-900">{title}</span>
          <span className="m-0 mt-2 line-clamp-3 block text-[14px] leading-6 text-navy-700">
            {contentToPlainText(note.content)}
          </span>
        </span>
      </button>

      <dl className="m-0 mt-4 flex flex-col gap-1 border-t border-line pt-3 text-[12px] leading-4 text-text-muted">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <dt>{t('Written')}</dt>
          <dd className="m-0">
            <time dateTime={note.createdAt}>{formatNoteDate(note.createdAt, timeZone, locale)}</time>
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
          <dt>{t('Deleted')}</dt>
          <dd className="m-0">
            <time dateTime={note.deletedAt}>{formatNoteDate(note.deletedAt, timeZone, locale)}</time>
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <CardActions name={title} onRestore={() => onRestore(note)} onDelete={() => onDelete(note)} />
      </div>
    </article>
  )
}

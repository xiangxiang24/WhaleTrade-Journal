import { Paperclip } from 'lucide-react'
import type { Emotion } from '../../shared/emotion/emotions'
import { contentToPlainText } from '../../shared/note-editor/content'
import MoodBadge from '../../shared/emotion/mood-badge'
import { formatNoteDate } from '../types/format-note-date'
import type { JournalNote } from '../../shared/types/journal-note'
import { useI18n } from '../../shared/i18n/use-i18n'

type JournalCardProps = {
  note: JournalNote
  /** เขตเวลาของผู้ใช้ (รหัส IANA) ใช้แปลงวันที่บนการ์ด */
  timeZone: string
  onOpen: (id: number) => void
}

// สีพื้นการ์ดตามอารมณ์ (design rules หัวข้อ 9.2; สีป้ายอยู่ใน MoodBadge) เขียน class เต็มเพื่อให้ Tailwind สแกนเจอ
const CARD_BG: Record<Emotion | 'none', string> = {
  overjoyed: 'bg-navy-900',
  happy: 'bg-navy-700',
  neutral: 'bg-navy-700',
  worried: 'bg-navy-900',
  sad: 'bg-navy-900',
  none: 'bg-navy-700',
}
const DEFAULT_TITLE = 'Today Journal'

// การ์ดโน้ต 1 ใบ: ทั้งใบเป็นลิงก์เดียว มีกระดาษซ้อนด้านหลังและคลิปทอง
// Hover: พื้นเปลี่ยนเป็นฟ้าอย่างนุ่ม การ์ดลอยขึ้นเล็กน้อย กระดาษด้านหลังเลื่อนออกและเอียง คลิปแกว่ง
export default function JournalCard({ note, timeZone, onOpen }: JournalCardProps) {
  const { t, locale } = useI18n()
  const key = note.emotion ?? 'none'
  const title = note.title?.trim() || t(DEFAULT_TITLE)

  return (
    <div className="group relative">
      {/* กระดาษซ้อนด้านหลัง */}
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-bottom-right translate-x-2.5 translate-y-2.5 rounded-lg bg-blue-200 transition-transform duration-500 ease-(--ease-soft) group-hover:translate-x-3.5 group-hover:translate-y-3 group-hover:rotate-2 motion-reduce:transition-none"
      />

      <a
        href={`/journal/${note.id}`}
        onClick={(event) => {
          event.preventDefault()
          onOpen(note.id)
        }}
        className={`relative flex h-56 flex-col rounded-lg p-5 text-surface shadow-sm transition-[background-color,translate,scale,box-shadow] duration-300 ease-(--ease-soft) group-hover:-translate-y-1 group-hover:bg-blue-500 group-hover:shadow-lg active:scale-[0.98] motion-reduce:transition-none ${CARD_BG[key]}`}
      >
        {/* คลิปทอง (ตกแต่ง) */}
        <Paperclip
          size={40}
          strokeWidth={2.25}
          aria-hidden="true"
          className="pointer-events-none absolute -top-2.5 right-3 origin-bottom text-gold-400 transition-transform duration-500 ease-(--ease-soft) group-hover:-translate-y-0.5 group-hover:-rotate-12 motion-reduce:transition-none"
        />

        <MoodBadge emotion={note.emotion} />

        <h3 className="m-0 mt-3 truncate text-[22px] leading-7 font-bold">{title}</h3>
        <p className="m-0 mt-2 line-clamp-4 text-[12px] leading-4 text-surface/85 transition-colors duration-300 group-hover:text-surface">
          {contentToPlainText(note.content)}
        </p>

        <div className="mt-auto border-t border-surface/25 pt-2.5">
          <time
            dateTime={note.createdAt}
            className="text-[12px] leading-4 text-surface/85 transition-colors duration-300 group-hover:text-surface"
          >
            {formatNoteDate(note.createdAt, timeZone, locale)}
          </time>
        </div>
      </a>
    </div>
  )
}

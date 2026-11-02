import { useId, useMemo } from 'react'
import { CircleAlert } from 'lucide-react'
import { contentToPlainText } from '../../shared/note-editor/content'
import NoteEditor from '../../shared/note-editor/note-editor'
import { countWords } from '../../shared/note-form/count-words'

type EntryFieldsProps = {
  title: string
  content: string
  /** ข้อความ error ของช่องเนื้อหา (เช่นเว้นว่างตอนกดบันทึก) */
  contentError?: string
  onTitleChange: (value: string) => void
  onContentChange: (value: string) => void
}

const TITLE_MAX = 120
const LABEL = 'text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase'

// ช่อง TITLE และ REFLECTIVE THOUGHTS (พร้อมตัวนับคำ)
export default function EntryFields({
  title,
  content,
  contentError,
  onTitleChange,
  onContentChange,
}: EntryFieldsProps) {
  const titleId = useId()
  const contentId = useId()
  const contentLabelId = useId()
  const wordCount = useMemo(() => countWords(contentToPlainText(content)), [content])

  return (
    <>
      <div>
        <label htmlFor={titleId} className={`block ${LABEL}`}>
          Title
        </label>
        <input
          id={titleId}
          type="text"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Today Journal"
          className="mt-1.5 h-12 w-full rounded-xl bg-blue-50 px-5 text-[17px] leading-6 font-bold text-navy-900 outline-none transition-shadow duration-150 placeholder:font-medium placeholder:text-text-muted focus:shadow-focus min-[640px]:text-[20px]"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3">
          <span id={contentLabelId} className={LABEL}>
            Reflective thoughts
          </span>
          <span className="text-[12px] leading-4 text-text-muted tabular-nums" aria-live="polite">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
        <div className="mt-1.5">
          <NoteEditor
            value={content}
            onChange={onContentChange}
            labelledBy={contentLabelId}
            describedBy={contentError ? `${contentId}-error` : undefined}
            invalid={Boolean(contentError)}
            minHeightClass="min-h-64 short:min-h-40"
          />
        </div>
        {contentError && (
          <p
            id={`${contentId}-error`}
            className="m-0 mt-1.5 flex items-start gap-1.5 text-[12px] leading-4 text-navy-900"
          >
            <CircleAlert size={14} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0 text-red-500" />
            {contentError}
          </p>
        )}
      </div>
    </>
  )
}

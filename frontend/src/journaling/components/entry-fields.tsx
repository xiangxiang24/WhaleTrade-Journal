import { useId, useMemo } from 'react'
import { CircleAlert } from 'lucide-react'
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
  const wordCount = useMemo(() => countWords(content), [content])

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
          <label htmlFor={contentId} className={LABEL}>
            Reflective thoughts
          </label>
          <span className="text-[12px] leading-4 text-text-muted tabular-nums" aria-live="polite">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
        <textarea
          id={contentId}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder="Why did you invest? What would change your mind? What will you measure?"
          aria-invalid={Boolean(contentError)}
          aria-describedby={contentError ? `${contentId}-error` : undefined}
          className={`mt-1.5 min-h-64 w-full flex-1 resize-y rounded-md bg-parchment p-4 text-[15px] leading-[28px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus short:min-h-40 min-[640px]:text-[17px] min-[640px]:leading-[30px] ${
            contentError ? 'ring-2 ring-red-500' : ''
          }`}
        />
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

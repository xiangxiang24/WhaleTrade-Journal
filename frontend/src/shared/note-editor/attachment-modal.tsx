import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CircleAlert, File as FileIcon, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
import {
  FILE_MAX_BYTES,
  IMAGE_MAX_BYTES,
  formatBytes,
  uploadAttachment,
  type AttachmentKind,
} from '../data/attachments'
import ModalFrame from '../modal/modal-frame'

export type AttachmentResult =
  | { kind: 'image'; url: string; name: string }
  | { kind: 'file'; url: string; name: string; size: number; mime: string }
  | { kind: 'link'; url: string; label: string }

type AttachmentModalProps = {
  open: boolean
  /** แทรกสิ่งที่แนบลงตัวแก้ไข (ถ้าไม่สำเร็จให้ throw Error) */
  onInsert: (result: AttachmentResult) => void
  /** เรียกเมื่อ modal ปิดเสร็จ (แทรกสำเร็จ, กด Cancel หรือกด Esc) */
  onClose: () => void
}

type Tab = 'image' | 'file' | 'link'

const TABS: { id: Tab; label: string; icon: typeof ImageIcon }[] = [
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'file', label: 'File', icon: FileIcon },
  { id: 'link', label: 'Link', icon: LinkIcon },
]

const EXIT_MS = 200
const INPUT =
  'mt-1.5 h-11 w-full rounded-pill border-2 border-blue-500 bg-surface px-4 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus'

// ลิงก์ต้องเป็น http(s) หรือ mailto เท่านั้น (เติม https:// ให้ถ้าผู้ใช้ไม่ได้พิมพ์)
function normalizeUrl(raw: string): string | null {
  const value = raw.trim()
  if (!value) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(withScheme)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

function Dialog({ onInsert, onClose }: Omit<AttachmentModalProps, 'open'>) {
  const [closing, setClosing] = useState(false)
  const [tab, setTab] = useState<Tab>('image')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const fileInput = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const descId = useId()

  // รอให้แอนิเมชันออกเล่นจบก่อนค่อยแจ้งผู้เรียก
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  function chooseTab(next: Tab) {
    setTab(next)
    setFile(null)
    setError(undefined)
  }

  const canInsert = tab === 'link' ? url.trim() !== '' : file !== null

  async function handleInsert() {
    if (busy || !canInsert) return
    setError(undefined)
    if (tab === 'link') {
      const normalized = normalizeUrl(url)
      if (!normalized) {
        setError('Please enter a valid link, for example https://example.com')
        return
      }
      onInsert({ kind: 'link', url: normalized, label: label.trim() })
      setClosing(true)
      return
    }
    if (!file) return
    setBusy(true)
    try {
      const kind: AttachmentKind = tab
      const uploaded = await uploadAttachment(file, kind)
      onInsert(
        kind === 'image'
          ? { kind: 'image', url: uploaded.url, name: uploaded.name }
          : { kind: 'file', url: uploaded.url, name: uploaded.name, size: uploaded.size, mime: uploaded.mime },
      )
      setClosing(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not attach this file. Please try again.')
      setBusy(false)
    }
  }

  const limit = tab === 'image' ? IMAGE_MAX_BYTES : FILE_MAX_BYTES

  return (
    // กัน keyboard event (Esc/Tab) ลอยไปถึง modal ฟอร์มที่ครอบอยู่ (React ส่ง event ผ่าน portal ไปยัง parent)
    <div onKeyDown={(event) => event.stopPropagation()}>
      <ModalFrame
        titleId={titleId}
        descId={descId}
        closing={closing}
        onRequestClose={() => {
          if (!busy) setClosing(true)
        }}
        cardClassName="max-w-130 p-6 text-left"
      >
        <h2 id={titleId} className="m-0 text-[22px] leading-8 font-bold text-navy-900">
          Add attachment
        </h2>
        <p id={descId} className="m-0 mt-1 text-[14px] leading-5 text-text-muted">
          Attach an image, a file or a link to your journal.
        </p>

        <div role="tablist" aria-label="Attachment type" className="mt-4 flex gap-1 rounded-pill bg-blue-50 p-1">
          {TABS.map(({ id, label: tabLabel, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              data-no-bounce
              aria-selected={tab === id}
              onClick={() => chooseTab(id)}
              className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-pill text-[14px] leading-5 font-semibold transition-colors duration-150 ${
                tab === id ? 'bg-surface text-navy-900 shadow-sm' : 'text-navy-700 hover:bg-blue-100'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              {tabLabel}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === 'link' ? (
            <div className="flex flex-col gap-4">
              <label className="block text-[12px] leading-4 font-semibold text-navy-900">
                Link
                <input
                  data-autofocus
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com"
                  className={INPUT}
                />
              </label>
              <label className="block text-[12px] leading-4 font-semibold text-navy-900">
                Text to show (optional)
                <input
                  type="text"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Annual report"
                  className={INPUT}
                />
              </label>
            </div>
          ) : (
            <div>
              <input
                ref={fileInput}
                type="file"
                accept={tab === 'image' ? 'image/*' : undefined}
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null)
                  setError(undefined)
                }}
              />
              <button
                data-autofocus
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 px-4 py-8 text-center transition-colors duration-150 hover:bg-blue-100"
              >
                <span className="text-[15px] leading-6 font-semibold text-navy-900">
                  {file ? file.name : tab === 'image' ? 'Choose an image' : 'Choose a file'}
                </span>
                <span className="text-[12px] leading-4 text-text-muted">
                  {file ? formatBytes(file.size) : `Up to ${formatBytes(limit)}`}
                </span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="m-0 mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
            <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => setClosing(true)}
            className="inline-flex h-11 items-center rounded-pill border-2 border-blue-200 bg-surface px-6 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canInsert || busy}
            onClick={handleInsert}
            className="inline-flex h-11 items-center rounded-pill bg-blue-500 px-6 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:shadow-none"
          >
            {busy ? 'Attaching…' : 'Insert'}
          </button>
        </div>
      </ModalFrame>
    </div>
  )
}

// กล่องแนบ ภาพ / ไฟล์ / ลิงก์ (เปิดจากคำสั่ง /Attachment) render ผ่าน portal ไปที่ body เพราะ position: fixed
// ภายใน element ที่มี transform จะอ้างอิง element นั้นแทนหน้าต่าง
export default function AttachmentModal({ open, ...props }: AttachmentModalProps) {
  return open ? createPortal(<Dialog {...props} />, document.body) : null
}

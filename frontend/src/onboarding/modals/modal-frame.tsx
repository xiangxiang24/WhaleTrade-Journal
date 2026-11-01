import { useEffect, useRef, type ReactNode } from 'react'

type ModalFrameProps = {
  titleId: string
  descId: string
  /** true ระหว่างเล่นแอนิเมชันปิด */
  closing: boolean
  /** ขอปิด modal (กด Esc) */
  onRequestClose: () => void
  children: ReactNode
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// กรอบ modal กลางจอ: ฉากหลังจางเข้า การ์ดเด้งขึ้นมา กัก focus ไว้ในกล่อง ปิดด้วย Esc
export default function ModalFrame({
  titleId,
  descId,
  closing,
  onRequestClose,
  children,
}: ModalFrameProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 ${
        closing ? 'animate-scrim-out' : 'animate-scrim-in'
      }`}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onRequestClose()
          if (event.key !== 'Tab') return
          const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
          if (items.length === 0) return
          const first = items[0]
          const last = items[items.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first.focus()
          }
        }}
        className={`max-h-full w-full max-w-116 overflow-y-auto rounded-3xl bg-surface px-12 py-10 text-center shadow-lg ${
          closing ? 'animate-modal-out' : 'animate-modal-pop'
        } motion-reduce:animate-none`}
      >
        {children}
      </div>
    </div>
  )
}

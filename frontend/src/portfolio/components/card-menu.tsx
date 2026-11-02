import { useEffect, useId, useRef, useState } from 'react'
import { EllipsisVertical, Pencil, Trash2 } from 'lucide-react'

type CardMenuProps = {
  portfolioName: string
  onOpenChange?: (open: boolean) => void
  onEdit: () => void
  onTrash: () => void
}

const ITEM =
  'flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-[14px] leading-5 font-medium transition-colors duration-150 focus-visible:bg-blue-50 hover:bg-blue-50'

// เมนู 3 จุดของการ์ด: แก้ชื่อ/คำอธิบาย/เป้าหมาย และย้ายไปถังขยะ (Soft Delete)
export default function CardMenu({ portfolioName, onOpenChange, onEdit, onTrash }: CardMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  function toggle(next: boolean) {
    setOpen(next)
    onOpenChange?.(next)
  }

  // เปิดแล้วโฟกัสรายการแรก, คลิกนอกกล่อง/Esc = ปิด (Esc คืนโฟกัสให้ปุ่ม), ลูกศรขึ้น/ลงเลื่อนระหว่างรายการ
  useEffect(() => {
    if (!open) return
    rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    function handlePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        onOpenChange?.(false)
      }
    }
    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [open, onOpenChange])

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      toggle(false)
      triggerRef.current?.focus()
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
    const index = items.indexOf(document.activeElement as HTMLElement)
    const step = event.key === 'ArrowDown' ? 1 : -1
    items[(index + step + items.length) % items.length]?.focus()
  }

  return (
    <div ref={rootRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`More options for ${portfolioName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => toggle(!open)}
        className="inline-flex size-9 items-center justify-center rounded-pill text-navy-700 hover:bg-blue-50 active:bg-blue-100 aria-expanded:bg-blue-100"
      >
        <EllipsisVertical size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={`${portfolioName} options`}
          className="absolute top-full right-0 z-20 mt-1 w-52 animate-scrim-in rounded-lg border border-line bg-surface p-1 shadow-lg motion-reduce:animate-none"
        >
          <button
            type="button"
            role="menuitem"
            data-no-bounce
            onClick={() => {
              toggle(false)
              onEdit()
            }}
            className={`${ITEM} text-navy-900`}
          >
            <Pencil size={16} strokeWidth={1.75} aria-hidden="true" className="text-navy-700" />
            Edit details
          </button>
          <button
            type="button"
            role="menuitem"
            data-no-bounce
            onClick={() => {
              toggle(false)
              onTrash()
            }}
            className={`${ITEM} text-navy-900 hover:bg-red-50 focus-visible:bg-red-50`}
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" className="text-red-500" />
            Move to Trash
          </button>
        </div>
      )}
    </div>
  )
}

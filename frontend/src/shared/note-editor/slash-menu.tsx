import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { SlashItem } from './slash-items'

export type SlashMenuHandle = {
  onKeyDown: (event: KeyboardEvent) => boolean
}

type SlashMenuProps = {
  items: SlashItem[]
  command: (item: SlashItem) => void
}

// เมนูคำสั่ง / ที่ลอยตามเคอร์เซอร์: ไอคอน + ชื่อ แถวที่เลือก/ชี้เป็นพื้นเทาอ่อน กลุ่มบล็อกกับกลุ่มแทรกคั่นด้วยเส้น
// เลือกด้วยลูกศรขึ้น/ลง + Enter ได้ (Esc ปิดโดย Suggestion)
const SlashMenu = forwardRef<SlashMenuHandle, SlashMenuProps>(function SlashMenu({ items, command }, ref) {
  const [selected, setSelected] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  // เมื่อรายการเปลี่ยน (กรองด้วยตัวอักษรที่พิมพ์) เริ่มเลือกแถวแรกใหม่
  const [previousItems, setPreviousItems] = useState(items)
  if (previousItems !== items) {
    setPreviousItems(items)
    setSelected(0)
  }

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (items.length === 0) return false
      if (event.key === 'ArrowDown') {
        setSelected((current) => (current + 1) % items.length)
        return true
      }
      if (event.key === 'ArrowUp') {
        setSelected((current) => (current - 1 + items.length) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        command(items[selected])
        return true
      }
      return false
    },
  }))

  if (items.length === 0) {
    return (
      <div className="w-64 rounded-2xl bg-surface p-4 text-[14px] leading-5 text-text-muted shadow-lg">
        No matching commands
      </div>
    )
  }

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="Commands"
      className="no-scrollbar m-0 max-h-(--slash-max-h,34rem) w-64 list-none overflow-y-auto rounded-2xl bg-surface p-2 shadow-lg"
    >
      {items.map((item, index) => {
        const Icon = item.icon
        const startsInsertGroup = item.group === 'insert' && items[index - 1]?.group === 'blocks'
        return (
          <li key={item.id} role="presentation">
            {startsInsertGroup && <hr className="mx-2 my-2 border-0 border-t border-line" />}
            <button
              type="button"
              role="option"
              aria-selected={index === selected}
              data-no-bounce
              // mousedown กันไม่ให้ตัวแก้ไขเสียโฟกัสก่อนคำสั่งทำงาน
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setSelected(index)}
              onClick={() => command(item)}
              className={`flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-left text-[16px] leading-6 font-medium text-navy-900 transition-colors duration-100 ${
                index === selected ? 'bg-blue-50' : ''
              }`}
            >
              <Icon size={20} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-navy-700" />
              {item.label}
            </button>
          </li>
        )
      })}
    </ul>
  )
})

export default SlashMenu

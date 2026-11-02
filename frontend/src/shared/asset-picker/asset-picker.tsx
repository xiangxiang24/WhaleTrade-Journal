import { useId, useState } from 'react'
import { CircleAlert, Search } from 'lucide-react'
import { searchAssets } from '../data/assets'
import type { Asset } from '../types/transaction'

type AssetPickerProps = {
  label: string
  value: Asset | null
  onChange: (asset: Asset) => void
  error?: string
}

const displayOf = (asset: Asset | null) => (asset ? `${asset.ticker} · ${asset.name}` : '')

// ช่องเลือกหุ้น/กองทุนจากรายการกลาง (Feature 6): พิมพ์ค้นหาแล้วเลือก ไม่พิมพ์ชื่อเอง
// combobox + listbox ใช้ลูกศรขึ้น/ลง + Enter เลือก, Esc ปิดรายการ (ไม่ปิด modal ที่ครอบอยู่ตอนรายการเปิด)
export default function AssetPicker({ label, value, onChange, error }: AssetPickerProps) {
  const [text, setText] = useState(displayOf(value))
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputId = useId()
  const listId = useId()
  const errorId = `${inputId}-error`

  // เลือกอยู่แล้วและยังไม่ได้แก้ข้อความ = แสดงรายการทั้งหมดให้เปลี่ยนตัวได้
  const results = searchAssets(value && text === displayOf(value) ? '' : text)

  function choose(asset: Asset) {
    onChange(asset)
    setText(displayOf(asset))
    setOpen(false)
  }

  return (
    <div className="relative">
      <label htmlFor={inputId} className="block text-[12px] leading-4 font-semibold text-navy-900">
        {label}
      </label>
      <div className="relative mt-1.5">
        <Search
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-blue-500"
        />
        <input
          id={inputId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${listId}-${results[active].id}` : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          value={text}
          placeholder="Search SCB, TISCO, Apple…"
          onFocus={(event) => {
            event.currentTarget.select()
            setOpen(true)
          }}
          onBlur={() => {
            setOpen(false)
            setText(displayOf(value))
          }}
          onChange={(event) => {
            setText(event.target.value)
            setActive(0)
            setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              setOpen(true)
              const step = event.key === 'ArrowDown' ? 1 : -1
              setActive((current) => (current + step + results.length) % Math.max(results.length, 1))
            } else if (event.key === 'Enter' && open && results[active]) {
              event.preventDefault()
              choose(results[active])
            } else if (event.key === 'Escape' && open) {
              event.stopPropagation()
              setOpen(false)
            }
          }}
          className={`h-11 w-full rounded-pill border-2 bg-surface pr-4 pl-10 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus ${
            error ? 'border-red-500' : 'border-blue-500'
          }`}
        />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 z-30 mt-1 max-h-60 list-none overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-lg"
        >
          {results.length === 0 && <li className="px-3 py-3 text-[13px] leading-5 text-text-muted">No matching stock or fund</li>}
          {results.map((asset, index) => (
            <li
              key={asset.id}
              id={`${listId}-${asset.id}`}
              role="option"
              aria-selected={value?.id === asset.id}
              // mousedown + preventDefault: เลือกได้โดยช่องไม่เสียโฟกัส (ไม่งั้น blur ปิดรายการก่อนคลิกจะทำงาน)
              onMouseDown={(event) => {
                event.preventDefault()
                choose(asset)
              }}
              onMouseEnter={() => setActive(index)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 ${
                index === active ? 'bg-blue-50' : ''
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-[14px] leading-5 font-semibold text-navy-900">{asset.name}</span>
                <span className="block text-[12px] leading-4 text-text-muted">
                  {asset.market}: {asset.ticker}
                  {asset.sector ? ` • ${asset.sector}` : ''}
                </span>
              </span>
              <span className="shrink-0 rounded-pill bg-blue-100 px-2 py-0.5 text-[11px] leading-4 font-semibold text-navy-700">
                {asset.type === 'fund' ? 'Fund' : 'Stock'}
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p id={errorId} className="m-0 mt-1.5 flex items-start gap-1.5 text-[12px] leading-4 text-navy-900">
          <CircleAlert size={14} strokeWidth={1.75} className="mt-px shrink-0 text-red-500" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

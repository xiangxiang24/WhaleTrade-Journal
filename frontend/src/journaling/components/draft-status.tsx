import { useEffect, useState } from 'react'
import { Cloud, CloudCheck, CloudUpload } from 'lucide-react'
import { formatRelativeTime } from '../types/format-relative-time'
import type { DraftState } from '../types/journaling'

type DraftStatusProps = {
  state: DraftState
  /** เวลาที่บันทึกร่างล่าสุด (มิลลิวินาที) */
  savedAt: number | null
}

// ป้ายสถานะการบันทึกอัตโนมัติ: "Draft Autosaved • Just now" (เวลาอัปเดตเองทุก 30 วินาที)
export default function DraftStatus({ state, savedAt }: DraftStatusProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  let Icon = CloudCheck
  let text = 'No unsaved changes'
  if (state === 'saving') {
    Icon = CloudUpload
    text = 'Saving draft…'
  } else if (state === 'saved' && savedAt !== null) {
    Icon = Cloud
    text = `Draft Autosaved • ${formatRelativeTime(savedAt, now)}`
  }

  return (
    <p
      role="status"
      aria-live="polite"
      className="m-0 inline-flex items-center gap-2 rounded-pill bg-blue-100 px-5 py-2 text-[14px] leading-6 font-medium text-navy-700 min-[640px]:text-[15px]"
    >
      <Icon size={20} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
      {text}
    </p>
  )
}

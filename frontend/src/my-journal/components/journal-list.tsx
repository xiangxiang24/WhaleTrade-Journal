import type { ReactNode } from 'react'
import { PenLine } from 'lucide-react'
import logo from '../../assets/Logo.png'
import type { JournalNote } from '../../shared/types/journal-note'
import type { JournalLoadStatus } from '../types/journal'
import JournalCard from './journal-card'

type JournalListProps = {
  status: JournalLoadStatus
  /** โน้ตหลังกรองและเรียงแล้ว (ใหม่ → เก่า) */
  notes: JournalNote[]
  /** จำนวนโน้ตทั้งหมดของผู้ใช้ก่อนกรอง (แยกกรณียังไม่มีโน้ต กับกรณีค้นหาไม่เจอ) */
  totalCount: number
  timeZone: string
  onOpenNote: (id: number) => void
  onNewNote: () => void
  onClearFilters: () => void
  onRetry: () => void
}

// 3 การ์ดต่อแถว (กว้างน้อยกว่า 1100 เหลือ 2, น้อยกว่า 640 เหลือ 1) ช่องไฟกว้างพอไม่ให้กระดาษด้านหลังชนการ์ดข้างเคียง การ์ดกว้างกว่าสูงเป็นสี่เหลี่ยมผืนผ้า
const GRID =
  'grid grid-cols-1 gap-x-12 gap-y-10 pr-4 pb-4 min-[640px]:grid-cols-2 min-[1100px]:grid-cols-3'

const PRIMARY_BUTTON =
  'inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[16px] leading-6 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900'

function EmptyState({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <img className="h-40 w-auto" src={logo} alt="" />
      <p className="m-0 mt-4 text-[15px] leading-6 font-semibold text-navy-900">{title}</p>
      <p className="m-0 mt-1 max-w-100 text-[13px] leading-5 text-text-muted">{description}</p>
      <div className="mt-5">{children}</div>
    </div>
  )
}

// รายการโน้ตเป็นกริด + สถานะ กำลังโหลด / ผิดพลาด / ยังไม่มีโน้ต / ค้นหาไม่เจอ
export default function JournalList({
  status,
  notes,
  totalCount,
  timeZone,
  onOpenNote,
  onNewNote,
  onClearFilters,
  onRetry,
}: JournalListProps) {
  if (status === 'loading') {
    return (
      <div className={GRID} role="status" aria-label="Loading your journals">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-56 animate-pulse rounded-lg bg-blue-100 motion-reduce:animate-none" />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <EmptyState title="Could not load your journals" description="Something went wrong. Please try again.">
        <button type="button" onClick={onRetry} className={PRIMARY_BUTTON}>
          Try again
        </button>
      </EmptyState>
    )
  }

  if (totalCount === 0) {
    return (
      <EmptyState title="No journal notes yet" description="Write your first note to keep your reasons next to your decisions.">
        <button type="button" onClick={onNewNote} className={PRIMARY_BUTTON}>
          <PenLine size={18} strokeWidth={1.75} aria-hidden="true" />
          New Note
        </button>
      </EmptyState>
    )
  }

  if (notes.length === 0) {
    return (
      <EmptyState title="No notes match your search" description="Try a different word or clear the filters.">
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex h-9 items-center rounded-pill px-4 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100"
        >
          Clear filters
        </button>
      </EmptyState>
    )
  }

  return (
    <ul className={`${GRID} m-0 list-none p-0 pr-4 pb-4`}>
      {notes.map((note) => (
        <li key={note.id}>
          <JournalCard note={note} timeZone={timeZone} onOpen={onOpenNote} />
        </li>
      ))}
    </ul>
  )
}

import type { DraftState } from '../types/journaling'
import BackButton from './back-button'
import DraftStatus from './draft-status'

type JournalingHeaderProps = {
  draftState: DraftState
  draftSavedAt: number | null
  onBack: () => void
}

// ส่วนหัว: ปุ่ม Back to Journals + ชื่อหน้า + คำโปรย (ซ้าย) / สถานะฉบับร่าง (ขวา ย้ายลงใต้ชื่อในจอเล็ก)
export default function JournalingHeader({ draftState, draftSavedAt, onBack }: JournalingHeaderProps) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="m-0 text-[28px] leading-9 font-bold text-navy-900 min-[640px]:text-[36px] min-[640px]:leading-11 min-[1280px]:text-[40px] min-[1280px]:leading-12">
            Write Reflection Journal
          </h1>
          <p className="m-0 mt-1 text-[14px] leading-6 text-navy-700 min-[640px]:text-[16px]">
            Your thoughts are safe, private, and encrypted
          </p>
        </div>
        <DraftStatus state={draftState} savedAt={draftSavedAt} />
      </div>
    </div>
  )
}

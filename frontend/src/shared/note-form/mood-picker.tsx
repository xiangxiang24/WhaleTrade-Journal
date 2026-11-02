import { useId } from 'react'
import EmotionIcon from '../emotion/emotion-icon'
import { EMOTIONS, NO_EMOTION_LABEL, type Emotion } from '../emotion/emotions'

type MoodOptionsProps = {
  value: Emotion | null
  onChange: (value: Emotion | null) => void
  /** md = ฟอร์มใน modal, lg = หน้า Journaling (อีโมจิใหญ่) */
  size?: 'md' | 'lg'
  /** ชื่อกลุ่มสำหรับโปรแกรมอ่านหน้าจอ */
  labelledBy?: string
}

// ปุ่มกว้างเต็มช่อง (แบ่งความยาวทั้งแถบเท่าๆ กัน 5 ช่อง) จึงกดง่าย กล่องตอนเลือก/hover ก็กว้างเท่าช่อง
const SLOT_SIZE = {
  md: 'h-14 min-[640px]:h-16',
  lg: 'h-16 min-[640px]:h-[72px]',
}
const EMOJI_SIZE = {
  md: 'size-9 min-[640px]:size-10',
  lg: 'size-11 min-[640px]:size-14',
}

// แถบเลือกอารมณ์ 5 แบบ (design rules หัวข้อ 8.3)
// ปกติ: ช่องโปร่งใส / hover: พื้น blue-100 + อีโมจิขยาย 1.1 / กด: อีโมจิย่อ 0.9 / เลือกอยู่: พื้น blue-100 + ขอบ 2px blue-500
// กดซ้ำที่ตัวที่เลือกอยู่ = ยกเลิก (ไม่ระบุ)
export function MoodOptions({ value, onChange, size = 'md', labelledBy }: MoodOptionsProps) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      className="flex gap-2 rounded-xl bg-blue-50 p-2"
    >
      {EMOTIONS.map(({ id, label }) => {
        const selected = value === id
        return (
          <div key={id} className="flex min-w-0 flex-1 justify-center">
            <button
              type="button"
              data-no-bounce
              aria-pressed={selected}
              aria-label={label}
              onClick={() => onChange(selected ? null : id)}
              className={`group flex w-full items-center justify-center rounded-2xl border-2 transition-colors duration-150 ${SLOT_SIZE[size]} ${
                selected
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-transparent hover:bg-blue-100 active:bg-blue-100'
              }`}
            >
              <EmotionIcon
                emotion={id}
                className={`${EMOJI_SIZE[size]} transition-transform duration-150 ease-out group-hover:scale-110 group-active:scale-90`}
              />
            </button>
          </div>
        )
      })}
    </div>
  )
}

type MoodPickerProps = Pick<MoodOptionsProps, 'value' | 'onChange'>

// ตัวเลือกอารมณ์พร้อมคำถามและชื่ออารมณ์ที่เลือก (ใช้ในฟอร์ม modal)
export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  const labelId = useId()
  const selectedLabel = EMOTIONS.find((item) => item.id === value)?.label ?? NO_EMOTION_LABEL

  return (
    <div>
      <p id={labelId} className="m-0 text-[16px] leading-6 font-semibold text-navy-900">
        How do you feel about this decision?
      </p>
      <p className="m-0 mt-0.5 text-[13px] leading-5 text-text-muted">
        You can change this anytime. No judgment here.
      </p>
      <div className="mt-3">
        <MoodOptions value={value} onChange={onChange} labelledBy={labelId} />
      </div>
      <p className="m-0 mt-2 text-[13px] leading-5 text-text-muted" aria-live="polite">
        {selectedLabel}
      </p>
    </div>
  )
}

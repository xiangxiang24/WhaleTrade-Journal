import { useId } from 'react'
import EmotionIcon from '../emotion/emotion-icon'
import { EMOTIONS, NO_EMOTION_LABEL, type Emotion } from '../emotion/emotions'

type MoodPickerProps = {
  value: Emotion | null
  onChange: (value: Emotion | null) => void
}

// ตัวเลือกอารมณ์ 5 แบบ (design rules หัวข้อ 8.3): กดซ้ำที่ตัวที่เลือกอยู่ = ยกเลิก (ไม่ระบุ)
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

      <div
        role="group"
        aria-labelledby={labelId}
        className="mt-3 flex gap-2 rounded-xl bg-blue-50 p-2"
      >
        {EMOTIONS.map(({ id, label }) => {
          const selected = value === id
          return (
            <button
              key={id}
              type="button"
              data-no-bounce
              aria-pressed={selected}
              aria-label={label}
              onClick={() => onChange(selected ? null : id)}
              className={`group flex h-14 min-w-0 flex-1 items-center justify-center rounded-2xl border-2 transition-colors duration-150 min-[640px]:h-16 ${
                selected
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-transparent hover:bg-blue-100 active:bg-blue-100'
              }`}
            >
              <EmotionIcon
                emotion={id}
                className="size-9 transition-transform duration-150 ease-out group-hover:scale-110 group-active:scale-90 min-[640px]:size-10"
              />
            </button>
          )
        })}
      </div>
      <p className="m-0 mt-2 text-[13px] leading-5 text-text-muted" aria-live="polite">
        {selectedLabel}
      </p>
    </div>
  )
}

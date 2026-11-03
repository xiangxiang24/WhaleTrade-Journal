import EmotionIcon from '../../shared/emotion/emotion-icon'
import { EMOTIONS } from '../../shared/emotion/emotions'
import type { MoodFilterValue } from '../types/journal'
import { useI18n } from '../../shared/i18n/use-i18n'

type MoodFilterProps = {
  value: MoodFilterValue
  /** จำนวนโน้ตของแต่ละอารมณ์ (ไม่รวมผลการค้นหา) */
  counts: Record<MoodFilterValue, number>
  onChange: (value: MoodFilterValue) => void
}

const CHIP =
  'inline-flex h-9 items-center gap-2 rounded-pill px-3.5 text-[13px] leading-5 font-medium whitespace-nowrap transition-colors duration-150 min-[640px]:h-11 min-[640px]:px-5 min-[640px]:text-[15px] min-[640px]:leading-6'

// แถวชิปกรองตามอารมณ์: All + 5 อารมณ์ พร้อมจำนวนในวงเล็บ (ชิปที่เลือกอยู่ = พื้น blue-500 ตัวขาว)
export default function MoodFilter({ value, counts, onChange }: MoodFilterProps) {
  const { t } = useI18n()
  const options: { id: MoodFilterValue; label: string }[] = [
    { id: 'all', label: t('All') },
    ...EMOTIONS.map(({ id, label }) => ({ id, label: t(label) })),
  ]

  return (
    <div role="group" aria-label={t('Filter by mood')} className="flex flex-wrap gap-2 min-[640px]:gap-3">
      {options.map(({ id, label }) => {
        const selected = value === id
        return (
          <button
            key={id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(id)}
            className={`${CHIP} ${
              selected
                ? 'bg-blue-500 text-surface'
                : 'bg-blue-50 text-navy-900 hover:bg-blue-100 active:bg-blue-100'
            }`}
          >
            {id !== 'all' && <EmotionIcon emotion={id} variant="outline" className="size-5 min-[640px]:size-6" />}
            <span>
              {label} <span className="opacity-70">({counts[id]})</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

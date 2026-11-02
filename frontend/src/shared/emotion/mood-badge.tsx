import EmotionIcon from './emotion-icon'
import { EMOTIONS, NO_EMOTION_LABEL, type Emotion } from './emotions'

type MoodBadgeProps = {
  emotion: Emotion | null
  /** sm = บนการ์ดโน้ต, lg = หัวฟอร์มในหน้า Journaling */
  size?: 'sm' | 'lg'
}

// สีพื้นป้ายตามอารมณ์ (design rules หัวข้อ 9.2) เขียน class เต็มเพื่อให้ Tailwind สแกนเจอ
const BADGE_BG: Record<Emotion | 'none', string> = {
  overjoyed: 'bg-mood-overjoyed text-surface',
  happy: 'bg-mood-happy text-surface',
  neutral: 'bg-mood-neutral text-surface',
  worried: 'bg-mood-worried text-surface',
  sad: 'bg-mood-sad text-surface',
  none: 'bg-blue-100 text-navy-700',
}

const SIZE = {
  sm: { box: 'h-6 gap-1.5 px-2.5 text-[12px] leading-4', icon: 'size-4' },
  lg: { box: 'h-10 gap-2 px-4 text-[16px] leading-6', icon: 'size-6' },
}

// ป้ายแสดงอารมณ์ที่เลือก: อีโมจิ + ชื่ออารมณ์ ตัวขาวบนพื้นสีเข้ม (ไม่ระบุ = พื้น blue-100 ตัวสีเข้ม)
export default function MoodBadge({ emotion, size = 'sm' }: MoodBadgeProps) {
  const label = EMOTIONS.find((item) => item.id === emotion)?.label ?? NO_EMOTION_LABEL
  const { box, icon } = SIZE[size]
  return (
    <span
      className={`inline-flex w-fit items-center rounded-pill font-semibold ${box} ${
        BADGE_BG[emotion ?? 'none']
      }`}
    >
      <EmotionIcon emotion={emotion} className={icon} />
      {label}
    </span>
  )
}

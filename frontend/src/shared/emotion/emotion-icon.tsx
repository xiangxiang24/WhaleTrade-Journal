import happyImage from '../../assets/emotions/happy.png'
import neutralImage from '../../assets/emotions/neutral.png'
import overjoyedImage from '../../assets/emotions/overjoyed.png'
import sadImage from '../../assets/emotions/sad.png'
import worriedImage from '../../assets/emotions/worried.png'
import type { Emotion } from './emotions'

// อีโมจิ Fluent Emoji (3D) ที่ติดไปกับแอป ที่มาและสัญญาอนุญาตอยู่ใน assets/emotions/SOURCE.md
const EMOJI_IMAGES: Record<Emotion, string> = {
  overjoyed: overjoyedImage,
  happy: happyImage,
  neutral: neutralImage,
  worried: worriedImage,
  sad: sadImage,
}

type EmotionIconProps = {
  /** null = ไม่ระบุ (แสดงหน้าเรียบๆ แบบสีเทาจาง) */
  emotion: Emotion | null
  /** filled = อีโมจิ 3D สำหรับป้ายบนการ์ด, outline = หน้าแบบเส้นสำหรับชิปกรอง */
  variant?: 'filled' | 'outline'
  /** กำหนดขนาดด้วย class เช่น "size-4" */
  className?: string
}

// แบบเส้น (outline) วาดเป็น SVG ในโค้ด: ยิ้มกว้าง / ยิ้มหลับตา / ปากเบี้ยว / คิ้วตก / ร้องไห้
function Features({ emotion }: { emotion: Emotion | null }) {
  switch (emotion) {
    case 'overjoyed':
      return (
        <>
          <circle cx="8.5" cy="10" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="10" r="1.2" fill="currentColor" stroke="none" />
          <path d="M7 13 Q12 20.5 17 13 Z" fill="currentColor" />
        </>
      )
    case 'happy':
      return (
        <>
          <path d="M7.4 10.6 Q9 8.6 10.6 10.6" />
          <path d="M13.4 10.6 Q15 8.6 16.6 10.6" />
          <path d="M8 14 Q12 18.2 16 14" />
        </>
      )
    case 'worried':
      return (
        <>
          <circle cx="8.5" cy="11" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="11" r="1.1" fill="currentColor" stroke="none" />
          <path d="M6.8 8 L10.2 9.2" />
          <path d="M17.2 8 L13.8 9.2" />
          <path d="M8.8 16.4 Q12 13.8 15.2 16.4" />
        </>
      )
    case 'sad':
      return (
        <>
          <path d="M7.4 10 Q9 11.8 10.6 10" />
          <path d="M13.4 10 Q15 11.8 16.6 10" />
          <path d="M8 12.6 L8 16" />
          <path d="M16 12.6 L16 16" />
          <path d="M9.4 17.4 Q12 15.4 14.6 17.4" />
        </>
      )
    default:
      // neutral และไม่ระบุ: ตากลมกับปากเบี้ยว
      return (
        <>
          <circle cx="8.5" cy="10" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="10" r="1.2" fill="currentColor" stroke="none" />
          <path d="M8.5 15.6 L15.5 14.2" />
        </>
      )
  }
}

export default function EmotionIcon({ emotion, variant = 'filled', className = 'size-4' }: EmotionIconProps) {
  const filled = variant === 'filled'

  // แบบเต็ม: รูปอีโมจิ (ไม่ระบุ = หน้าปากเบี้ยวสีเทาจาง ตามหัวข้อ 8.1)
  if (filled) {
    return (
      <img
        src={EMOJI_IMAGES[emotion ?? 'neutral']}
        alt=""
        aria-hidden="true"
        className={`${className} object-contain ${emotion === null ? 'opacity-45 grayscale' : ''}`}
      />
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
      className={`${className} text-navy-700 ${emotion === null ? 'opacity-45 grayscale' : ''}`}
    >
      <circle cx="12" cy="12" r="10.5" />
      <Features emotion={emotion} />
    </svg>
  )
}

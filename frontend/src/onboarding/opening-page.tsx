import { useEffect, useRef } from 'react'
import logo from '../assets/Logo.png'
import { usePageLeave } from '../shared/hooks/use-page-leave'

type OpeningPageProps = {
  /** เรียกเมื่อเล่นแอนิเมชันและค้างหน้าจอครบเวลาแล้ว ให้ผู้เรียกตัดสินใจนำทาง (Onboarding หรือ My Journals) */
  onFinish?: () => void
}

// Splash: เล่นแอนิเมชันและค้างหน้าจอรวมประมาณ 2-3 วินาที (onboarding-page.md หัวข้อ 1.2)
const DISPLAY_MS = 2600

export default function OpeningPage({ onFinish }: OpeningPageProps) {
  // เก็บ callback ล่าสุดไว้ใน ref เพื่อไม่ให้ตัวจับเวลาเริ่มใหม่เมื่อผู้เรียกส่งฟังก์ชันตัวใหม่เข้ามา
  const onFinishRef = useRef(onFinish)
  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  // ครบเวลาแล้วเนื้อหาลอยขึ้นและจางหาย ก่อนนำทางไปหน้า Onboarding
  const { leaving, leaveTo } = usePageLeave()
  useEffect(() => {
    const timer = setTimeout(() => leaveTo(() => onFinishRef.current?.()), DISPLAY_MS)
    return () => clearTimeout(timer)
  }, [leaveTo])

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center bg-surface ${
        leaving ? 'animate-page-out motion-reduce:animate-none' : ''
      }`}
    >
      {/* โลโก้วาฬ 160: ขยายจากเล็กไปขนาดเต็มอย่างนุ่มนวล */}
      <img
        className="h-40 w-auto animate-logo-in motion-reduce:animate-none"
        src={logo}
        alt=""
      />
      {/* ชื่อแอป: เด้งช้าๆ หลังวาฬขยายครบ */}
      <h1 className="m-0 mt-4 text-center text-[28px] leading-9 font-bold text-navy-900 animate-title-bounce motion-reduce:animate-none">
        Whale Trade Journal
      </h1>
      {/* สโลแกน: ค่อยๆ ลงมาช้าๆ ตามหลังชื่อแอป */}
      <p className="m-0 mt-1 text-center text-[15px] leading-[22px] font-medium text-navy-700 animate-tagline-in motion-reduce:animate-none">
        Elevate Your Trading Mindset
      </p>
    </main>
  )
}

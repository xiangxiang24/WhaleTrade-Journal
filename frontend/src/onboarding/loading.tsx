import { useEffect, useRef } from 'react'
import whale from '../assets/Loading.png'
import { usePageLeave } from './components/use-page-leave'

type LoadingProps = {
  /** เรียกเมื่อแถบโหลดเต็มแล้ว ให้ผู้เรียกพาไปหน้าถัดไป (My Journals) */
  onFinish?: () => void
  /** เวลาที่แถบใช้เติมจนเต็ม (มิลลิวินาที) */
  durationMs?: number
}

// หน้า Loading หลัง Login / Register สำเร็จ: วาฬว่ายน้ำ แถบโหลดเติมจาก 0 → 100%
export default function Loading({ onFinish, durationMs = 2400 }: LoadingProps) {
  const { leaving, leaveTo } = usePageLeave()

  // เก็บ callback ล่าสุดไว้ใน ref เพื่อไม่ให้ตัวจับเวลาเริ่มใหม่เมื่อผู้เรียกส่งฟังก์ชันตัวใหม่เข้ามา
  const onFinishRef = useRef(onFinish)
  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  // แถบเต็มแล้วเนื้อหาลอยขึ้นและจางหาย ก่อนนำทางไปหน้าถัดไป
  useEffect(() => {
    const timer = setTimeout(() => leaveTo(() => onFinishRef.current?.()), durationMs)
    return () => clearTimeout(timer)
  }, [leaveTo, durationMs])

  return (
    <main
      aria-busy="true"
      className={`flex min-h-screen flex-col items-center justify-center bg-surface px-8 ${
        leaving ? 'animate-page-out motion-reduce:animate-none' : ''
      }`}
    >
      {/* วาฬว่ายน้ำ: ภาพเดียวแบ่งเป็น 2 ชั้นตามเส้นแบ่งเหนือคลื่น (เส้นแบ่งเอียงตามปลายคลื่นด้านขวา)
          ชั้นบน (ตัววาฬ) เอนและส่ายตามจังหวะว่าย ชั้นล่าง (คลื่น) ไหลสวนทางกัน */}
      <div className="animate-fade-up motion-reduce:animate-none">
        <div className="relative h-[clamp(160px,calc(100vh_-_380px),356px)]">
          <img
            className="block h-full w-auto origin-[30%_70%] animate-swim [clip-path:polygon(0_0,100%_0,100%_86%,80%_86%,65%_88.5%,0_88.5%)] motion-reduce:animate-none"
            src={whale}
            alt=""
          />
          <img
            className="absolute inset-0 h-full w-full animate-wave [clip-path:polygon(0_88.5%,65%_88.5%,80%_86%,100%_86%,100%_100%,0_100%)] motion-reduce:animate-none"
            src={whale}
            alt=""
          />
        </div>
      </div>

      <div className="mt-6 animate-fade-up text-center [animation-delay:80ms] motion-reduce:animate-none">
        <h1 className="m-0 text-[28px] leading-9 font-bold text-navy-900 min-[1280px]:text-[32px] min-[1280px]:leading-10">
          Whale Trade Journal
        </h1>
        <p className="m-0 mt-1 text-[16px] leading-6 font-medium text-navy-700 min-[1280px]:text-[18px] min-[1280px]:leading-[26px]">
          Elevate Your Trading Mindset
        </p>
      </div>

      {/* แถบโหลด: track blue-100, fill navy-700 มีจุดกลมที่ปลายแถบ (ตาม Figma) */}
      <div
        role="progressbar"
        aria-label="Loading"
        className="mt-6 h-2 w-[min(410px,100%)] animate-fade-up rounded-pill bg-blue-100 [animation-delay:160ms] motion-reduce:animate-none"
      >
        <div
          className="relative h-full w-full animate-loading-fill rounded-pill bg-navy-700 motion-reduce:animate-none"
          style={{ animationDuration: `${durationMs}ms` }}
        >
          <span
            aria-hidden="true"
            className="absolute top-1/2 right-0 size-3 -translate-y-1/2 rounded-pill bg-blue-200 ring-2 ring-blue-500/40"
          />
        </div>
      </div>
    </main>
  )
}

import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import banner from '../../assets/Banner.png'
import OnboardingHeader from './onboarding-header'

type OnboardingShellProps = {
  /** true ระหว่างเล่นแอนิเมชันออกจากหน้า */
  leaving: boolean
  /** ข้อความปุ่มสลับมุมมองใต้เส้นคั่นด้านขวา */
  switchLabel: string
  onSwitch?: () => void
  /** ส่วนล่างของหน้า (ปุ่มหรือการ์ดบัญชี) */
  children: ReactNode
}

// โครงร่วมของหน้า Onboarding ทั้งสองสถานะ: แถบหัว + ปุ่มสลับ + แบนเนอร์ + หัวข้อ + คำโปรย
export default function OnboardingShell({
  leaving,
  switchLabel,
  onSwitch,
  children,
}: OnboardingShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface px-8 min-[1280px]:px-15">
      <OnboardingHeader />

      {/* เนื้อหาใต้แถบหัว: เข้าด้วยการลอยขึ้นทีละส่วน ออกด้วยการลอยขึ้นและจางหาย (แถบหัวอยู่นิ่ง) */}
      <div className={`flex flex-1 flex-col ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
        <div className="mt-5.5 flex animate-fade-up justify-end motion-reduce:animate-none">
          <button
            type="button"
            onClick={onSwitch}
            className="inline-flex items-center gap-2 rounded-pill text-[16px] leading-6 font-medium text-blue-500 hover:text-navy-700"
          >
            <RefreshCw size={20} strokeWidth={1.75} aria-hidden="true" />
            {switchLabel}
          </button>
        </div>

        <main className="flex flex-1 flex-col items-center justify-center pt-4 pb-8">
          {/* แบนเนอร์ย่อตามความสูงหน้าต่าง: สูงสุด 436 (ตาม Figma) ต่ำสุด 200 เพื่อให้ทั้งหน้าพอดีที่ 1024 × 680 */}
          <img
            className="w-[clamp(200px,calc(100vh_-_440px),436px)] max-w-full animate-fade-up rounded-xl [animation-delay:80ms] motion-reduce:animate-none"
            src={banner}
            alt=""
          />
          <div className="animate-fade-up text-center [animation-delay:160ms] motion-reduce:animate-none">
            <h1 className="m-0 mt-6 text-[26px] leading-9 font-bold text-navy-900">
              Welcome to Whale Trade Journal
            </h1>
            <p className="m-0 mt-1 text-[12px] leading-[22px] text-navy-900">
              Your portfolio and dividend garden are growing quietly
              <br />
              have you recorded today's progress toward your goals yet?
            </p>
          </div>
          <div className="mt-6 flex w-full animate-fade-up flex-col items-center [animation-delay:240ms] motion-reduce:animate-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

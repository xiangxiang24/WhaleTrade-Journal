import type { ReactNode } from 'react'
import logo from '../../assets/Logo.png'
import BackButton from './back-button'
import OnboardingHeader from './onboarding-header'

type AuthLayoutProps = {
  title: string
  subtitle: string
  /** true ระหว่างเล่นแอนิเมชันออกจากหน้า */
  leaving: boolean
  onBack: () => void
  /** ฟอร์มที่อยู่ในการ์ดฝั่งขวา */
  children: ReactNode
  /** modal ที่แสดงทับหน้า */
  modal?: ReactNode
}

// โครงร่วมของหน้า Login / Register: แถบหัว + ปุ่มกลับ + หัวข้อ + การ์ด (ภาพประกอบซ้าย ฟอร์มขวา)
export default function AuthLayout({
  title,
  subtitle,
  leaving,
  onBack,
  children,
  modal,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface px-8 min-[1280px]:px-15">
      <OnboardingHeader />

      <div className={`flex flex-1 flex-col ${leaving ? 'animate-page-out motion-reduce:animate-none' : ''}`}>
        <div className="mt-8 short:mt-4 animate-fade-up motion-reduce:animate-none">
          <BackButton onClick={onBack} />
        </div>

        <main className="flex flex-1 flex-col items-center justify-center pt-4 pb-8 short:pt-2 short:pb-4">
          <div className="animate-fade-up text-center [animation-delay:80ms] motion-reduce:animate-none">
            <h1 className="m-0 text-[36px] leading-11 font-bold text-navy-900 min-[1280px]:text-[44px] min-[1280px]:leading-13 short:text-[28px] short:leading-9">
              {title}
            </h1>
            <p className="m-0 mt-1 text-[22px] leading-8 font-medium text-navy-700 min-[1280px]:text-[32px] min-[1280px]:leading-10 short:text-[16px] short:leading-6">
              {subtitle}
            </p>
          </div>

          <div className="mt-9 short:mt-4 flex w-full max-w-110 animate-fade-up overflow-hidden rounded-4xl border border-line bg-surface shadow-md [animation-delay:160ms] min-[1100px]:max-w-215 motion-reduce:animate-none">
            {/* ส่วนภาพประกอบ: ซ่อนเมื่อหน้าต่างกว้างน้อยกว่า 1100 */}
            <aside className="relative hidden w-[46%] shrink-0 flex-col items-center justify-center overflow-hidden bg-linear-to-b from-blue-50 to-parchment/50 px-8 py-10 text-center min-[1100px]:flex">
              <img className="w-42 animate-float motion-reduce:animate-none" src={logo} alt="" />
              <p lang="th" className="m-0 mt-4 text-[16px] leading-6 font-bold text-navy-900">
                ยินดีต้อนรับกลับสู่บันทึกการลงทุน
              </p>
              <p className="m-0 mt-1 max-w-66 text-[13px] leading-[22px] text-navy-900">
                Mindful sanctuary for patient investors. No noise, just your personal convictions.
              </p>
              <span aria-hidden="true" className="absolute bottom-6 left-2 size-9 rounded-pill border-[6px] border-blue-200/60" />
              <span aria-hidden="true" className="absolute bottom-3 left-14 size-5 rounded-pill border-[5px] border-blue-200/60" />
              <span aria-hidden="true" className="absolute bottom-8 left-12 size-3 rounded-pill border-4 border-blue-200/60" />
            </aside>

            {children}
          </div>
        </main>
      </div>

      {modal}
    </div>
  )
}

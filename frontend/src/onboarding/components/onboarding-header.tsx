// แถบหัวของทุกหน้าใน Onboarding: จุด + ชื่อแอป + เส้นคั่นด้านล่าง
export default function OnboardingHeader() {
  return (
    <header className="flex items-center gap-2 border-b-2 border-blue-200 pt-11 pb-3 short:pt-6">
      <span aria-hidden="true" className="size-2 rounded-pill bg-navy-700" />
      <span className="text-[20px] leading-7 font-semibold text-navy-900">Whale Trade Journal</span>
    </header>
  )
}

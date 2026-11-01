import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary'

// ปุ่มแคปซูลใหญ่ของหน้า Onboarding ตามดีไซน์ Figma
const base =
  'inline-flex h-13 short:h-12 items-center justify-center gap-2 rounded-pill px-8 text-[20px] font-semibold shadow-cta transition-colors duration-150 disabled:cursor-not-allowed disabled:shadow-none'

const variants: Record<Variant, string> = {
  primary:
    'bg-blue-500 text-surface hover:bg-navy-700 active:bg-navy-900 disabled:bg-blue-200 disabled:hover:bg-blue-200',
  secondary:
    'border-2 border-blue-200 bg-surface text-blue-500 hover:bg-blue-50 active:bg-blue-100',
}

type OnboardingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

export default function OnboardingButton({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: OnboardingButtonProps) {
  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />
}

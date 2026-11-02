import type { ReactNode } from 'react'

type StepCardProps = {
  step: number
  title: string
  description: string
  /** ขวาของหัวการ์ด (เช่น สวิตช์ หรือไอคอนตกแต่ง) */
  aside?: ReactNode
  children?: ReactNode
}

// กรอบของแต่ละขั้นตอน: วงกลมเลขขั้น + หัวข้อ + คำอธิบาย + เนื้อหา
export default function StepCard({ step, title, description, aside, children }: StepCardProps) {
  return (
    <section aria-label={title} className="rounded-4xl bg-surface p-5 shadow-md min-[640px]:p-6">
      <header className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-blue-100 text-[13px] leading-5 font-bold text-navy-700"
        >
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 text-[19px] leading-7 font-bold text-navy-900 min-[640px]:text-[20px]">{title}</h2>
          <p className="m-0 text-[13px] leading-5 text-text-muted">{description}</p>
        </div>
        {aside}
      </header>
      {children && <div className="mt-5">{children}</div>}
    </section>
  )
}

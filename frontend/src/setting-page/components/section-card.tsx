import type { ReactNode } from 'react'

type SectionCardProps = {
  title: string
  description: string
  children: ReactNode
  /** ไอดีหัวข้อ (ผูก aria-labelledby ของ section) */
  id: string
}

// กรอบของแต่ละ section ในหน้า Setting: หัวข้อ + คำอธิบาย + เส้นแบ่ง + เนื้อหา
export default function SectionCard({ id, title, description, children }: SectionCardProps) {
  return (
    <section aria-labelledby={id} className="rounded-4xl bg-surface p-5 shadow-md min-[640px]:p-8">
      <header className="border-b border-line pb-4">
        <h2 id={id} className="m-0 text-[22px] leading-8 font-bold text-navy-900 min-[640px]:text-[24px]">
          {title}
        </h2>
        <p className="m-0 text-[13px] leading-5 text-text-muted">{description}</p>
      </header>
      <div className="mt-5">{children}</div>
    </section>
  )
}

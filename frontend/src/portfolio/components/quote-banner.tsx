import { Flower2 } from 'lucide-react'
import { useI18n } from '../../shared/i18n/use-i18n'

// ข้อความเตือนใจคงที่ของหน้าจอ (portfolio-page.md หัวข้อ 3)
const QUOTE = 'Price is what you pay; dividends are what you collect. No rush, take your time.'
const CAPTION = 'A quiet reminder for patient compounding'
const AUTHOR = 'Warren E. Buffett'

// แถบข้อคิดท้ายหน้า: พื้น parchment ตามกฎกล่องข้อความแนะนำ (design rules 5.2)
export default function QuoteBanner() {
  const { t } = useI18n()
  return (
    <figure className="m-0 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-3xl bg-parchment px-5 py-4 min-[640px]:rounded-pill min-[640px]:px-8">
      <span
        aria-hidden="true"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-pill bg-blue-100 text-navy-700"
      >
        <Flower2 size={20} strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 basis-72">
        <blockquote className="m-0 text-[15px] leading-6 font-semibold text-navy-900 min-[640px]:text-[17px] min-[640px]:leading-7">
          “{t(QUOTE)}”
        </blockquote>
        <figcaption className="m-0 mt-0.5 text-[13px] leading-5 text-text-muted">{t(CAPTION)}</figcaption>
      </div>
      <p className="m-0 text-[12px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase">
        {AUTHOR}
      </p>
    </figure>
  )
}

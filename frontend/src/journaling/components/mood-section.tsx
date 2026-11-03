import { useId } from 'react'
import { ScrollText } from 'lucide-react'
import MoodBadge from '../../shared/emotion/mood-badge'
import type { Emotion } from '../../shared/emotion/emotions'
import { MoodOptions } from '../../shared/note-form/mood-picker'
import { useI18n } from '../../shared/i18n/use-i18n'

type MoodSectionProps = {
  value: Emotion | null
  onChange: (value: Emotion | null) => void
}

// ส่วนเลือกอารมณ์: ป้ายอารมณ์ปัจจุบัน + ป้าย Parchment Edition (ตกแต่ง) → คำถาม + ข้อความปลอบใจ → แถบอีโมจิ
export default function MoodSection({ value, onChange }: MoodSectionProps) {
  const { t } = useI18n()
  const headingId = useId()
  return (
    <section aria-labelledby={headingId}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MoodBadge emotion={value} size="lg" />
        <span className="inline-flex items-center gap-1.5 text-[12px] leading-4 text-text-muted">
          <ScrollText size={14} strokeWidth={1.75} aria-hidden="true" />
          {t('Parchment Edition')}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <h2
          id={headingId}
          className="m-0 text-[22px] leading-8 font-bold text-navy-900 min-[640px]:text-[28px] min-[640px]:leading-9 min-[1280px]:text-[32px] min-[1280px]:leading-10"
        >
          {t('How do you feel about this decision?')}
        </h2>
        <p className="m-0 max-w-60 text-[12px] leading-5 text-text-muted italic min-[1280px]:text-right">
          {t('You can change this anytime. No judgment here.')}
        </p>
      </div>

      <div className="mt-4">
        <MoodOptions value={value} onChange={onChange} size="lg" labelledBy={headingId} />
      </div>
    </section>
  )
}

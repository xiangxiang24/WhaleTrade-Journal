import { Sparkles } from 'lucide-react'
import { formatBaht, formatPercent } from '../types/format'
import type { CalcOutput } from '../types/target-amount'
import { useI18n } from '../../shared/i18n/use-i18n'

// วงโค้งตกแต่ง "after N years" (SVG ใช้สีจาก token) ซ่อนบนจอแคบ
function YearsArc({ years }: { years: number }) {
  const { t } = useI18n()
  return (
    <div className="relative hidden size-40 shrink-0 min-[640px]:block" aria-hidden="true">
      <svg viewBox="0 0 160 160" className="size-full">
        <circle cx="80" cy="80" r="74" fill="none" strokeWidth="2" strokeDasharray="4 9" strokeLinecap="round" className="stroke-blue-200" />
        <path d="M22 108 C 54 100, 70 34, 100 48 S 128 64, 144 56" fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-blue-500" />
        <circle cx="126" cy="52" r="9" className="fill-blue-200" />
      </svg>
      <p className="absolute inset-x-0 top-[66%] m-0 flex items-center justify-center gap-1 text-center text-[13px] leading-4 font-semibold text-navy-700">
        {t(years === 1 ? 'after {n} year' : 'after {n} years', { n: years })}
        <Sparkles size={12} strokeWidth={1.75} className="text-navy-700" />
      </p>
    </div>
  )
}

// การ์ดเงินปลายทางที่คาดว่าจะได้ (Expected amount banner)
export default function ExpectedBanner({ output }: { output: CalcOutput }) {
  const { t } = useI18n()
  return (
    <section
      aria-label={t('Expected amount')}
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-4xl border-2 border-blue-500 bg-surface p-5 min-[640px]:p-8"
    >
      <div className="min-w-0 flex-1 basis-72">
        <p className="m-0 text-[11px] leading-4 font-semibold tracking-[0.08em] text-text-muted uppercase">
          {t('Expected amount at the end')}
        </p>
        <p
          aria-live="polite"
          className="m-0 mt-2 text-[34px] leading-10 font-bold text-navy-900 tabular-nums min-[640px]:text-[44px] min-[640px]:leading-12"
        >
          {formatBaht(output.total)} <span className="text-[0.45em] font-semibold text-text-muted">{t('THB')}</span>
        </p>
        <p className="m-0 mt-2 max-w-120 text-[14px] leading-6 text-navy-700">
          {t('An estimated increase of')}{' '}
          <strong className="font-bold whitespace-nowrap text-navy-900 tabular-nums">
            +{formatBaht(output.dividends)} {t('THB')} (+{formatPercent(output.increasePct)})
          </strong>{' '}
          {t('solely generated from dividend compounding.')}
        </p>
      </div>
      <YearsArc years={output.years} />
    </section>
  )
}

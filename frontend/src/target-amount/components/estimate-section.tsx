import { Bookmark, FileDown, ImageDown, ShieldCheck, Sparkles } from 'lucide-react'
import type { CalcResult } from '../types/target-amount'
import ExpectedBanner from './expected-banner'
import ProportionCard from './proportion-card'
import { useI18n } from '../../shared/i18n/use-i18n'

type EstimateSectionProps = {
  result: CalcResult | null
  /** ค่าในฟอร์มเปลี่ยนไปจากตอนคำนวณล่าสุด */
  stale: boolean
  onSave: () => void
  onExport: (kind: 'PDF' | 'image') => void
}

const SECONDARY_BUTTON =
  'inline-flex h-11 items-center gap-2 rounded-pill border-2 border-blue-500 bg-surface px-5 text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:bg-blue-50 active:bg-blue-100 whitespace-nowrap max-[479px]:w-full max-[479px]:justify-center'

// Section 2: ผลประมาณการ (Your Estimate) ก่อนกดคำนวณแสดงข้อความรอ หลังคำนวณแสดง banner + สัดส่วน + ตาราง + ปุ่มบันทึก/ส่งออก
export default function EstimateSection({ result, stale, onSave, onExport }: EstimateSectionProps) {
  const { t } = useI18n()
  return (
    <section aria-labelledby="estimate-title" className="mt-10 min-[1280px]:mt-12">
      <div className="flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="inline-flex items-center gap-2 text-[13px] leading-5 font-semibold text-navy-700">
          <Sparkles size={16} strokeWidth={1.75} />
          {t('Simulated Future')}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <h2 id="estimate-title" className="m-0 mt-6 text-[26px] leading-9 font-bold text-navy-900 min-[640px]:text-[30px] min-[640px]:leading-10">
        {t('Your Estimate')}
      </h2>
      <p className="m-0 mt-1 text-[14px] leading-6 text-navy-700 min-[640px]:text-[16px]">
        {t('Here’s a gentle picture of where steady habits and reinvested dividends can lead.')}
      </p>

      {result === null ? (
        <p className="m-0 mt-5 rounded-4xl bg-surface px-6 py-12 text-center text-[15px] leading-6 text-text-muted shadow-md">
          {t('Your estimate will appear here after you press Calculate.')}
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-5">
          {stale && (
            <p role="status" className="m-0 rounded-3xl bg-blue-50 px-5 py-3 text-[13px] leading-5 text-navy-700">
              {t('Your inputs have changed. Press Recalculate to update this estimate.')}
            </p>
          )}
          <ExpectedBanner output={result.output} />
          <ProportionCard result={result} />
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-4xl bg-surface p-5 shadow-md min-[640px]:px-8">
            <div className="flex flex-wrap items-center gap-3 max-[639px]:w-full">
              <button
                type="button"
                onClick={onSave}
                className="inline-flex h-11 items-center gap-2 rounded-pill bg-blue-500 px-6 text-[14px] leading-5 font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900 whitespace-nowrap max-[479px]:w-full max-[479px]:justify-center"
              >
                <Bookmark size={16} strokeWidth={1.75} aria-hidden="true" />
                {t('Save plan')}
              </button>
              <button type="button" onClick={() => onExport('PDF')} className={SECONDARY_BUTTON}>
                <FileDown size={16} strokeWidth={1.75} aria-hidden="true" />
                {t('Export PDF')}
              </button>
              <button type="button" onClick={() => onExport('image')} className={SECONDARY_BUTTON}>
                <ImageDown size={16} strokeWidth={1.75} aria-hidden="true" />
                {t('Export image')}
              </button>
            </div>
            <p className="m-0 inline-flex items-center gap-2 text-[12px] leading-5 text-text-muted">
              <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
              {t('Verified 100% Client-Side Simulation')}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

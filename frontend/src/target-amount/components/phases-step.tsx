import { CircleAlert, Hourglass, Plus, Sprout, Trash2 } from 'lucide-react'
import { MAX_PHASES, stageName } from '../types/target-amount'
import type { Calculator } from '../types/use-calculator'
import NumberField from './number-field'
import StepCard from './step-card'
import { useI18n } from '../../shared/i18n/use-i18n'

// ข้อความชี้แจงสมมติฐานคงที่ (target-amount-page.md)
const ASSUMPTION =
  'We do not assume arbitrary stock price inflation, nor do we fluctuate calculations with volatile daily market ticks. This model presents a grounded, conservative compound estimate based exclusively on reinvested dividend streams.'

// สวิตช์เปิด/ปิด (design rules 7.4) ใช้ role="switch"
function Switch({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      data-no-bounce
      className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-pill transition-colors duration-200 ${on ? 'bg-blue-500' : 'bg-blue-200'}`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-0.5 size-5 rounded-pill bg-surface shadow-sm transition-transform duration-200 motion-reduce:transition-none ${on ? 'translate-x-5' : ''}`}
      />
    </button>
  )
}

// ขั้นตอนที่ 3: แบ่งเฟส (ไม่บังคับ) สวิตช์ + แถวเฟส + แถบสรุประยะเวลา + ข้อความสมมติฐาน
export default function PhasesStep({ calc }: { calc: Calculator }) {
  const { t } = useI18n()
  const { phasesOn, phases, errors } = calc
  const years = phases.map((phase) => Number(phase.yearsText.replace(/\D/g, '')) || 0)
  const totalYears = years.reduce((sum, value) => sum + value, 0)

  return (
    <StepCard
      step={3}
      title={t('Split into phases (optional)')}
      description={t('Adapt your monthly investment capacity as your career and income grow.')}
      aside={<Switch on={phasesOn} onChange={calc.togglePhases} label={t('Split into phases')} />}
    >
      {phasesOn && (
        <>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {phases.map((phase, index) => (
              <li key={phase.id} className="rounded-3xl bg-blue-50 p-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <div className="flex min-w-36 flex-1 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill bg-navy-700 text-[12px] leading-4 font-bold text-surface"
                    >
                      P{index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="m-0 text-[14px] leading-5 font-semibold text-navy-900">{t('Phase {n}', { n: index + 1 })}</p>
                      <p className="m-0 text-[12px] leading-4 text-text-muted">{t(stageName(index))}</p>
                    </div>
                  </div>
                  <div className="grid min-w-0 flex-[3] grid-cols-1 gap-3 min-[1024px]:grid-cols-2">
                    <NumberField
                      compact
                      label={t('Years')}
                      value={phase.yearsText}
                      onChange={(text) => calc.updatePhase(phase.id, { yearsText: text })}
                      maxDigits={2}
                      grouped={false}
                      placeholder="2"
                    />
                    <NumberField
                      compact
                      label={t('Monthly DCA')}
                      suffix={t('THB')}
                      value={phase.dcaText}
                      onChange={(text) => calc.updatePhase(phase.id, { dcaText: text })}
                      placeholder="5,000"
                    />
                  </div>
                  {phases.length > 1 && (
                    <button
                      type="button"
                      aria-label={t('Remove phase {n}', { n: index + 1 })}
                      onClick={() => calc.removePhase(phase.id)}
                      className="group/icon inline-flex size-9 shrink-0 items-center justify-center rounded-pill text-navy-700 hover:text-red-500 min-[640px]:mt-5"
                    >
                      <Trash2
                        size={18}
                        strokeWidth={1.75}
                        aria-hidden="true"
                        className="transition-[stroke-width] duration-150 group-hover/icon:stroke-[2.5]"
                      />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {errors.phases && (
            <p role="alert" className="m-0 mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-navy-900">
              <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-red-500" />
              {errors.phases}
            </p>
          )}

          <button
            type="button"
            onClick={calc.addPhase}
            disabled={phases.length >= MAX_PHASES}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-pill border-2 border-dashed border-blue-200 bg-surface text-[14px] leading-5 font-semibold text-navy-700 transition-colors duration-150 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50"
          >
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            {t('Add phase')}
          </button>

          <p className="m-0 mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-pill bg-blue-100 px-4 py-2 text-[12px] leading-5 font-semibold text-navy-700">
            <span className="inline-flex items-center gap-2">
              <Hourglass size={14} strokeWidth={1.75} aria-hidden="true" />
              {t('Calculated timeline')}
            </span>
            <span className="tabular-nums">
              {t('Total duration: {duration}', { duration: t(totalYears === 1 ? '{n} year' : '{n} years', { n: totalYears }) })}
              {phases.length > 1 && ` (${years.map((value) => t(value === 1 ? '{n} yr' : '{n} yrs', { n: value })).join(' + ')})`}
            </span>
          </p>
        </>
      )}

      <p className={`m-0 flex items-start gap-3 rounded-3xl bg-parchment px-4 py-3 text-[12px] leading-5 text-navy-700 ${phasesOn ? 'mt-3' : ''}`}>
        <Sprout size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0" />
        {t(ASSUMPTION)}
      </p>
    </StepCard>
  )
}

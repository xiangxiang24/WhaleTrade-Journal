import { Banknote } from 'lucide-react'
import type { Calculator } from '../types/use-calculator'
import NumberField from './number-field'
import StepCard from './step-card'
import { useI18n } from '../../shared/i18n/use-i18n'

// ขั้นตอนที่ 2: เงินต้น / DCA ต่อเดือน / ระยะเวลา (เปิดเฟสแล้ว DCA กับระยะเวลาถูกกำหนดจากเฟสแทน จึงกรอกไม่ได้)
export default function NumbersStep({ calc }: { calc: Calculator }) {
  const { t } = useI18n()
  const { phasesOn, errors } = calc
  return (
    <StepCard
      step={2}
      title={t('Your numbers')}
      description={t('Define your capital foundations and regular contribution cadence.')}
      aside={<Banknote size={20} strokeWidth={1.75} aria-hidden="true" className="mt-1 shrink-0 text-text-muted max-[639px]:hidden" />}
    >
      <div className="grid gap-4 min-[640px]:grid-cols-3">
        <NumberField
          label={t('Initial principal (THB)')}
          value={calc.principalText}
          onChange={calc.setPrincipalText}
          hint={t('Starting funds ready today')}
          error={errors.principal}
          placeholder="100,000"
        />
        <NumberField
          label={t('Monthly DCA (THB)')}
          value={phasesOn ? '' : calc.dcaText}
          onChange={calc.setDcaText}
          hint={phasesOn ? t('Set per phase below') : t('Added gently each month')}
          error={errors.dca}
          disabled={phasesOn}
          placeholder={phasesOn ? t('Per phase') : '5,000'}
        />
        <NumberField
          label={t('Duration (years)')}
          value={phasesOn ? String(calc.summary.totalYears) : calc.yearsText}
          onChange={calc.setYearsText}
          hint={phasesOn ? t('Sum of all phases') : t('Investment timeline horizon')}
          error={errors.duration}
          disabled={phasesOn}
          maxDigits={2}
          grouped={false}
          placeholder="10"
        />
      </div>
    </StepCard>
  )
}

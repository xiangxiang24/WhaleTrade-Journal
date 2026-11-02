import { Banknote } from 'lucide-react'
import type { Calculator } from '../types/use-calculator'
import NumberField from './number-field'
import StepCard from './step-card'

// ขั้นตอนที่ 2: เงินต้น / DCA ต่อเดือน / ระยะเวลา (เปิดเฟสแล้ว DCA กับระยะเวลาถูกกำหนดจากเฟสแทน จึงกรอกไม่ได้)
export default function NumbersStep({ calc }: { calc: Calculator }) {
  const { phasesOn, errors } = calc
  return (
    <StepCard
      step={2}
      title="Your numbers"
      description="Define your capital foundations and regular contribution cadence."
      aside={<Banknote size={20} strokeWidth={1.75} aria-hidden="true" className="mt-1 shrink-0 text-text-muted max-[639px]:hidden" />}
    >
      <div className="grid gap-4 min-[640px]:grid-cols-3">
        <NumberField
          label="Initial principal (THB)"
          value={calc.principalText}
          onChange={calc.setPrincipalText}
          hint="Starting funds ready today"
          error={errors.principal}
          placeholder="100,000"
        />
        <NumberField
          label="Monthly DCA (THB)"
          value={phasesOn ? '' : calc.dcaText}
          onChange={calc.setDcaText}
          hint={phasesOn ? 'Set per phase below' : 'Added gently each month'}
          error={errors.dca}
          disabled={phasesOn}
          placeholder={phasesOn ? 'Per phase' : '5,000'}
        />
        <NumberField
          label="Duration (years)"
          value={phasesOn ? String(calc.summary.totalYears) : calc.yearsText}
          onChange={calc.setYearsText}
          hint={phasesOn ? 'Sum of all phases' : 'Investment timeline horizon'}
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

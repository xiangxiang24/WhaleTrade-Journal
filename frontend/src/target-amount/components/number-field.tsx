import { useId } from 'react'
import { CircleAlert } from 'lucide-react'

type NumberFieldProps = {
  label: string
  value: string
  onChange: (text: string) => void
  /** ข้อความใต้ช่อง (ถ้าไม่มี error) */
  hint?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  /** ตัวอย่าง: "THB" (ชิดขวาในช่อง) */
  suffix?: string
  /** จำนวนหลักสูงสุด */
  maxDigits?: number
  /** แสดงคั่นหลักพัน (เงิน) */
  grouped?: boolean
  /** ป้ายชื่อแบบกะทัดรัด (ใช้ในแถวเฟส) */
  compact?: boolean
}

const group = (digits: string) => (digits ? new Intl.NumberFormat('en-US').format(Number(digits)) : '')

// ช่องตัวเลขจำนวนเต็มทรงแคปซูล (design rules 7.2): รับเฉพาะตัวเลข, คั่นหลักพันอัตโนมัติ, error/hint ใต้ช่อง
export default function NumberField({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder,
  disabled,
  suffix,
  maxDigits = 12,
  grouped = true,
  compact,
}: NumberFieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={`block font-semibold text-navy-900 ${compact ? 'text-[12px] leading-4 text-text-muted' : 'text-[12px] leading-4'}`}>
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          value={value}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '').slice(0, maxDigits)
            onChange(grouped ? group(digits) : digits)
          }}
          className={`h-11 short:h-10 w-full rounded-pill border-2 px-4 text-[15px] text-navy-900 tabular-nums outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus disabled:bg-blue-50 disabled:text-text-muted ${
            error ? 'border-red-500' : disabled ? 'border-blue-200' : 'border-blue-500'
          } ${suffix ? 'pr-14' : ''}`}
        />
        {suffix && (
          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[12px] font-semibold text-text-muted">
            {suffix}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="m-0 mt-1.5 flex items-start gap-1.5 text-[12px] leading-4 text-navy-900">
          <CircleAlert size={14} strokeWidth={1.75} className="mt-px shrink-0 text-red-500" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="m-0 mt-1.5 text-[12px] leading-4 text-text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

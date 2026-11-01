import { useState, type ReactNode } from 'react'
import { CircleAlert, Eye, EyeOff } from 'lucide-react'

// ช่องกรอกทรงแคปซูล (design rules หัวข้อ 7.2) ขอบสีฟ้าตาม Figma, error = ขอบแดง
const inputClass = (invalid: boolean) =>
  `h-11 short:h-10 w-full rounded-pill border-2 bg-surface px-4 text-[14px] text-navy-900 outline-none transition-shadow duration-150 placeholder:text-text-muted focus:shadow-focus ${
    invalid ? 'border-red-500' : 'border-blue-500'
  }`

const labelClass = 'block text-[12px] leading-4 font-semibold text-navy-900'

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="m-0 mt-1.5 flex items-start gap-1.5 text-[12px] leading-4 text-navy-900">
      <CircleAlert size={14} strokeWidth={1.75} className="mt-px shrink-0 text-red-500" aria-hidden="true" />
      {children}
    </p>
  )
}

type FieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  autoComplete?: string
}

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  type = 'text',
}: FieldProps & { type?: 'text' | 'email' }) {
  const errorId = `${id}-error`
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`${inputClass(Boolean(error))} mt-1.5`}
      />
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  )
}

// ช่องรหัสผ่านพร้อมปุ่มรูปตาแสดง/ซ่อน และช่องว่างด้านขวาของป้ายชื่อ (เช่นลิงก์ Forgot Password?)
export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  labelAction,
}: Omit<FieldProps, 'placeholder'> & { labelAction?: ReactNode }) {
  const [visible, setVisible] = useState(false)
  const errorId = `${id}-error`
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder="••••••••"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`${inputClass(Boolean(error))} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-pill text-navy-700 hover:bg-blue-50"
        >
          {visible ? (
            <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Eye size={18} strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      </div>
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  )
}

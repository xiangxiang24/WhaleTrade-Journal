import { formatAmount } from '../types/format'

type MoneyProps = {
  value: number
  /** class ของตัวเลข (ขนาด/น้ำหนัก) หน่วย THB ย่อเป็น 0.7 เท่าสี text-muted ตามหัวข้อ 3.2 */
  className?: string
}

// ตัวเลขเงิน + หน่วย THB (tabular-nums, ไม่ตัดบรรทัดระหว่างตัวเลขกับหน่วย)
export default function Money({ value, className = '' }: MoneyProps) {
  return (
    <span className={`whitespace-nowrap tabular-nums ${className}`}>
      {formatAmount(value)}
      <span className="ml-1 text-[0.7em] font-semibold text-text-muted">THB</span>
    </span>
  )
}

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import ModalFrame from '../../shared/modal/modal-frame'
import SuccessCheck from './success-check'

type RegisterSuccessModalProps = {
  open: boolean
  /** รหัสกู้คืนที่ระบบสร้างให้ตอนสมัคร (แสดงให้ผู้ใช้จดไว้) */
  recoveryCode: string
  /** เรียกเมื่อ modal ปิดเสร็จ (กด OK หรือกด Esc) */
  onClose: () => void
}

const EXIT_MS = 200
const COPIED_MS = 1500

function Dialog({ recoveryCode, onClose }: { recoveryCode: string; onClose: () => void }) {
  const [closing, setClosing] = useState(false)
  const [copied, setCopied] = useState(false)

  // รอให้แอนิเมชันออกเล่นจบก่อนค่อยแจ้งผู้เรียก
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  // ไอคอน Copy เปลี่ยนเป็นเครื่องหมายถูกชั่วครู่
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPIED_MS)
    return () => clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(recoveryCode)
      setCopied(true)
    } catch {
      // คัดลอกไม่ได้ (เช่นระบบไม่อนุญาต) ผู้ใช้ยังเลือกข้อความในกล่องแล้วคัดลอกเองได้
    }
  }

  return (
    <ModalFrame
      titleId="register-success-title"
      descId="register-success-desc"
      closing={closing}
      onRequestClose={() => setClosing(true)}
    >
      <SuccessCheck className="size-[clamp(96px,calc(100vh_-_580px),258px)]" />
      <h2 id="register-success-title" className="m-0 mt-6 text-[28px] leading-9 font-bold text-navy-900">
        Register Successful!
      </h2>
      <p id="register-success-desc" className="m-0 mt-3 text-[16px] leading-6 font-medium text-navy-700">
        You’ve gotten the “Recovery Password Code”. Please note that this key will give{' '}
        <strong className="font-semibold text-red-500">you only 1 time after finish registering.</strong>
      </p>

      <h3 className="m-0 mt-6 text-[28px] leading-9 font-bold text-blue-500">Recovery Code</h3>
      <div className="relative mt-3">
        <p className="m-0 flex h-13 items-center justify-center rounded-pill border-2 border-blue-500 bg-surface px-14 text-[20px] font-semibold tracking-[0.12em] text-blue-500 shadow-md select-all">
          {recoveryCode}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Recovery code copied' : 'Copy recovery code'}
          className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-pill text-blue-500 hover:bg-blue-50 active:bg-blue-100"
        >
          {copied ? (
            <Check size={20} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Copy size={20} strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      </div>
      <span role="status" className="sr-only">
        {copied ? 'Recovery code copied' : ''}
      </span>

      <button
        data-autofocus
        type="button"
        onClick={() => setClosing(true)}
        className="mt-6 inline-flex h-13 w-full items-center justify-center rounded-pill bg-blue-500 text-[20px] font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900"
      >
        OK
      </button>
    </ModalFrame>
  )
}

export default function RegisterSuccessModal({ open, recoveryCode, onClose }: RegisterSuccessModalProps) {
  // mount เฉพาะตอนเปิด เพื่อให้แอนิเมชันเริ่มใหม่ทุกครั้ง
  return open ? <Dialog recoveryCode={recoveryCode} onClose={onClose} /> : null
}

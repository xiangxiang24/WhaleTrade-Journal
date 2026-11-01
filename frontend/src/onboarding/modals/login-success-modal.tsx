import { useEffect, useState } from 'react'
import ModalFrame from './modal-frame'
import SuccessCheck from './success-check'

type LoginSuccessModalProps = {
  open: boolean
  /** เรียกเมื่อ modal ปิดเสร็จ (ครบเวลาอัตโนมัติ, กด OK หรือกด Esc) */
  onClose: () => void
}

// ค้าง modal ไว้ประมาณ 2 วินาทีแล้วปิดเอง
const AUTO_CLOSE_MS = 2000
const EXIT_MS = 200

function Dialog({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false)

  // ปิดเองอัตโนมัติเมื่อครบเวลา
  useEffect(() => {
    const timer = setTimeout(() => setClosing(true), AUTO_CLOSE_MS)
    return () => clearTimeout(timer)
  }, [])

  // รอให้แอนิเมชันออกเล่นจบก่อนค่อยแจ้งผู้เรียก
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  return (
    <ModalFrame
      titleId="login-success-title"
      descId="login-success-desc"
      closing={closing}
      onRequestClose={() => setClosing(true)}
    >
      <SuccessCheck className="size-[clamp(120px,calc(100vh_-_420px),258px)]" />
      <h2 id="login-success-title" className="m-0 mt-6 text-[28px] leading-9 font-bold text-navy-900">
        Login Successful!
      </h2>
      <p id="login-success-desc" className="m-0 mt-3 text-[16px] leading-6 font-medium text-navy-700">
        Please Login to your Whale Trade Journal
      </p>
      <button
        data-autofocus
        type="button"
        onClick={() => setClosing(true)}
        className="mt-8 inline-flex h-13 w-full items-center justify-center rounded-pill bg-blue-500 text-[20px] font-semibold text-surface shadow-cta transition-colors duration-150 hover:bg-navy-700 active:bg-navy-900"
      >
        OK
      </button>
    </ModalFrame>
  )
}

export default function LoginSuccessModal({ open, onClose }: LoginSuccessModalProps) {
  // mount เฉพาะตอนเปิด เพื่อให้แอนิเมชันและตัวจับเวลาเริ่มใหม่ทุกครั้ง
  return open ? <Dialog onClose={onClose} /> : null
}

import { useEffect, useId, useState } from 'react'
import ModalFrame from '../../shared/modal/modal-frame'
import SuccessCheck from './success-check'

type SuccessModalProps = {
  open: boolean
  title: string
  description: string
  /** ปิดเองเมื่อครบเวลา (มิลลิวินาที) ถ้าไม่ส่งมา modal จะปิดเมื่อกด OK หรือ Esc เท่านั้น */
  autoCloseMs?: number
  /** เรียกเมื่อ modal ปิดเสร็จ (ครบเวลา, กด OK หรือกด Esc) */
  onClose: () => void
}

const EXIT_MS = 200

function Dialog({ title, description, autoCloseMs, onClose }: Omit<SuccessModalProps, 'open'>) {
  const [closing, setClosing] = useState(false)
  const titleId = useId()
  const descId = useId()

  // ปิดเองอัตโนมัติเมื่อครบเวลา
  useEffect(() => {
    if (autoCloseMs === undefined) return
    const timer = setTimeout(() => setClosing(true), autoCloseMs)
    return () => clearTimeout(timer)
  }, [autoCloseMs])

  // รอให้แอนิเมชันออกเล่นจบก่อนค่อยแจ้งผู้เรียก
  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(onClose, EXIT_MS)
    return () => clearTimeout(timer)
  }, [closing, onClose])

  return (
    <ModalFrame
      titleId={titleId}
      descId={descId}
      closing={closing}
      onRequestClose={() => setClosing(true)}
    >
      <SuccessCheck className="size-[clamp(120px,calc(100vh_-_420px),258px)]" />
      <h2 id={titleId} className="m-0 mt-6 text-[28px] leading-9 font-bold text-navy-900">
        {title}
      </h2>
      <p id={descId} className="m-0 mt-3 text-[16px] leading-6 font-medium text-navy-700">
        {description}
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

// modal แจ้งสำเร็จแบบมีวงกลมเช็ก + หัวข้อ + คำอธิบาย + ปุ่ม OK (ใช้กับ Login และ Reset Password)
export default function SuccessModal({ open, ...props }: SuccessModalProps) {
  // mount เฉพาะตอนเปิด เพื่อให้แอนิเมชันและตัวจับเวลาเริ่มใหม่ทุกครั้ง
  return open ? <Dialog {...props} /> : null
}

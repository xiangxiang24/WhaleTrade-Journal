import SuccessModal from './success-modal'

type LoginSuccessModalProps = {
  open: boolean
  /** เรียกเมื่อ modal ปิดเสร็จ (ครบเวลาอัตโนมัติ, กด OK หรือกด Esc) */
  onClose: () => void
}

// ค้าง modal ไว้ประมาณ 2 วินาทีแล้วปิดเอง
const AUTO_CLOSE_MS = 2000

export default function LoginSuccessModal({ open, onClose }: LoginSuccessModalProps) {
  return (
    <SuccessModal
      open={open}
      title="Login Successful!"
      description="Please Login to your Whale Trade Journal"
      autoCloseMs={AUTO_CLOSE_MS}
      onClose={onClose}
    />
  )
}

import SuccessModal from './success-modal'

type ResetPasswordSuccessModalProps = {
  open: boolean
  /** เรียกเมื่อ modal ปิดเสร็จ (กด OK หรือกด Esc) */
  onClose: () => void
}

// ไม่ปิดเอง: ให้ผู้ใช้อ่านแล้วกด OK เพื่อไปหน้า Login
export default function ResetPasswordSuccessModal({ open, onClose }: ResetPasswordSuccessModalProps) {
  return (
    <SuccessModal
      open={open}
      title="Reset Password Successful!"
      description="Your password has been changed. Please Login with your new password."
      onClose={onClose}
    />
  )
}

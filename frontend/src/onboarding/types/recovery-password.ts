export type RecoveryPasswordData = {
  email: string
  recoveryCode: string
  newPassword: string
}

export type RecoveryPasswordErrors = {
  email?: string
  recoveryCode?: string
  newPassword?: string
  confirmPassword?: string
  /** ข้อผิดพลาดจากระบบ เช่น อีเมลหรือรหัสกู้คืนไม่ถูกต้อง */
  form?: string
}

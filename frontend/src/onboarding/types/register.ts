export type RegisterData = {
  fullName: string
  displayName: string
  email: string
  password: string
}

export type RegisterErrors = {
  fullName?: string
  displayName?: string
  email?: string
  password?: string
  confirmPassword?: string
  /** ข้อผิดพลาดจากระบบ เช่น อีเมลนี้ถูกใช้แล้ว */
  form?: string
}

export type RegisterResult = {
  /** รหัสกู้คืนที่ backend สร้างตอนสมัคร (แสดงให้ผู้ใช้ครั้งเดียว) */
  recoveryCode: string
}

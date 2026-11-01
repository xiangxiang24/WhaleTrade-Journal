export type LoginCredentials = {
  email: string
  password: string
}

export type LoginErrors = {
  email?: string
  password?: string
  /** ข้อผิดพลาดจากระบบ เช่น อีเมลหรือรหัสผ่านไม่ถูกต้อง */
  form?: string
}

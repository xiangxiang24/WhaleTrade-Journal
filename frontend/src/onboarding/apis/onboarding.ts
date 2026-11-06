import { request, setToken } from '../../shared/apis/client'
import type { Account } from '../../shared/types/account'
import type { LoginCredentials } from '../types/login'
import type { RecoveryPasswordData } from '../types/recovery-password'
import type { RegisterData, RegisterResult } from '../types/register'

type Session = { token: string; account: Account }

// POST /api/auth/register → เก็บ token แล้วคืนรหัสกู้คืน (แสดงให้ผู้ใช้ครั้งเดียว)
export async function registerAccount(data: RegisterData): Promise<RegisterResult & { account: Account }> {
  const { token, account, recoveryCode } = await request<Session & RegisterResult>('/api/auth/register', {
    method: 'POST',
    body: data,
  })
  setToken(token)
  return { recoveryCode, account }
}

// POST /api/auth/login → เก็บ token แล้วคืนบัญชี
export async function loginAccount(credentials: LoginCredentials): Promise<Account> {
  const { token, account } = await request<Session>('/api/auth/login', { method: 'POST', body: credentials })
  setToken(token)
  return account
}

// POST /api/auth/recover (ตั้งรหัสผ่านใหม่ด้วยรหัสกู้คืน; token เก่าทุกอันใช้ไม่ได้)
export async function recoverPassword(data: RecoveryPasswordData): Promise<void> {
  await request<void>('/api/auth/recover', { method: 'POST', body: data })
}

// GET /api/auth/me (ตรวจ token ที่เก็บไว้ตอนเปิดแอป)
export const fetchMe = () => request<Account>('/api/auth/me')

// ออกจากระบบ: ลบ token ฝั่งเครื่อง (ไม่มี session ฝั่ง server)
export const logoutAccount = () => setToken(null)

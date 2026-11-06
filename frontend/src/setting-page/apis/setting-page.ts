import { request, setToken } from '../../shared/apis/client'
import type { Account, Language } from '../../shared/types/account'

// GET /api/account
export const fetchAccount = () => request<Account>('/api/account')

// PATCH /api/account/profile  (avatarUrl: null = ลบรูป, data URL = รูปใหม่, URL เดิมจาก backend = ไม่เปลี่ยน)
export const updateProfile = (values: { displayName: string; avatarUrl: string | null }) =>
  request<Account>('/api/account/profile', { method: 'PATCH', body: values })

// PATCH /api/account/preferences  (ภาษา + เขตเวลา)
export const updatePreferences = (values: { language: Language; timezone: string }) =>
  request<Account>('/api/account/preferences', { method: 'PATCH', body: values })

// PATCH /api/account/email  (ต้องยืนยันรหัสผ่านปัจจุบัน)
export const updateEmail = (email: string, password: string) =>
  request<Account>('/api/account/email', { method: 'PATCH', body: { email, password } })

// POST /api/account/password  (token เก่าใช้ไม่ได้ ได้ token ใหม่กลับมาแล้วเก็บให้เลย)
export async function changePassword(current: string, next: string): Promise<void> {
  const { token } = await request<{ token: string }>('/api/account/password', { method: 'POST', body: { current, next } })
  setToken(token)
}

// POST /api/account/recovery-code  (ดูรหัสกู้คืนซ้ำ ต้องยืนยันรหัสผ่าน อย่าเก็บค้างในหน้าจอ)
export const showRecoveryCode = async (password: string) =>
  (await request<{ recoveryCode: string }>('/api/account/recovery-code', { method: 'POST', body: { password } })).recoveryCode

// DELETE /api/account  (ลบบัญชีและข้อมูลทั้งหมดถาวร)
export async function deleteAccount(): Promise<void> {
  await request<void>('/api/account', { method: 'DELETE' })
  setToken(null)
}

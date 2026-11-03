import type { Account, Language } from '../types/account'

// ที่เก็บข้อมูลจำลองของบัญชีผู้ใช้ (ในหน่วยความจำ) ไฟล์เดียวที่ต้องแก้ตอนต่อ backend
// รหัสผ่านจำลองเดียวกับที่ใช้ล็อกอินใน App.tsx (ของจริงเทียบ bcrypt ฝั่ง backend)
const MOCK_PASSWORD = 'Whale1234'
let currentPassword = MOCK_PASSWORD

let account: Account = {
  fullName: 'Thomas Westwood',
  displayName: 'Thomas W.',
  email: 'demo@whaletrade.app',
  avatarUrl: null,
  language: 'en',
  timezone: 'Asia/Bangkok',
}

const LATENCY_MS = 300
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

/** อ่านบัญชีปัจจุบันแบบทันที (ใช้ใน App ตั้งต้นค่า Sidebar/TopBar/เขตเวลา) */
export const getAccount = (): Account => ({ ...account })

// GET /me
export async function fetchAccount(): Promise<Account> {
  await delay()
  return { ...account }
}

// PATCH /me (Save Changes: ชื่อที่แสดง + รูปโปรไฟล์)
export async function updateProfile(values: { displayName: string; avatarUrl: string | null }): Promise<Account> {
  await delay()
  account = { ...account, ...values }
  return { ...account }
}

// PATCH /me/email (ต้องยืนยันรหัสผ่านปัจจุบัน และอีเมลต้องไม่ซ้ำกับบัญชีอื่น)
export async function updateEmail(email: string, password: string): Promise<Account> {
  await delay()
  if (password !== currentPassword) throw new Error('Current password is incorrect.')
  if (email.toLowerCase() === 'taken@example.com') throw new Error('This email is already used by another account.')
  account = { ...account, email }
  return { ...account }
}

// PATCH /me/preferences (Save preferences: ภาษา + เขตเวลา)
export async function updatePreferences(values: { language: Language; timezone: string }): Promise<Account> {
  await delay()
  account = { ...account, ...values }
  return { ...account }
}

// POST /me/password (ตรวจรหัสเดิม → บันทึก hash ใหม่ + เพิ่ม tokenVersion)
export async function changePassword(current: string, next: string): Promise<void> {
  await delay()
  if (current !== currentPassword) throw new Error('Current password is incorrect.')
  currentPassword = next
}

// DELETE /me (ลบบัญชีและข้อมูลลูกทั้งหมดถาวร; ข้อมูลจำลองยังไม่ลบข้อมูลของหน้าอื่น)
export async function deleteAccount(): Promise<void> {
  await delay()
}

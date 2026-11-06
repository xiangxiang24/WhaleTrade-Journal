// ตัวเรียก backend กลางของทุกหน้า: ใส่ token, แปลง JSON, และโยน Error ที่มีข้อความจาก backend
const TOKEN_KEY = 'whale-journal:token'

// ตอนพัฒนา Vite proxy /api ไป backend; ตอนเป็นแอปจริง (file://) ต้องเรียก backend ตรงๆ
const API_BASE = import.meta.env.VITE_API_URL ?? (location.protocol === 'file:' ? 'http://127.0.0.1:3001' : '')

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // เก็บ token ไม่ได้ (เช่นปิด storage): ผู้ใช้ต้องล็อกอินใหม่ทุกครั้งที่เปิดแอป
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

/** เรียก backend แล้วคืนค่า JSON (204 = undefined) ถ้าล้มเหลวโยน Error(ข้อความภาษาอังกฤษจาก backend ให้ t() แปลตอนแสดง) */
export async function request<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const token = getToken()
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(failure?.error ?? 'Something went wrong. Please try again.')
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}

/** ดาวน์โหลดไฟล์จาก backend (เช่น CSV) ด้วย token แล้วสั่งบันทึกลงเครื่อง ชื่อไฟล์ใช้ตามที่ backend ส่งมา */
export async function downloadFile(path: string, fallbackName: string): Promise<void> {
  const token = getToken()
  const response = await fetch(`${API_BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(failure?.error ?? 'Something went wrong. Please try again.')
  }
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const name = /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? fallbackName
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

/** อัปโหลดไฟล์เป็นไบต์ดิบ (ไม่ใช่ JSON) ชื่อไฟล์ส่งทาง query */
export async function uploadFile<T>(path: string, file: File): Promise<T> {
  const token = getToken()
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'application/octet-stream', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: file,
  })
  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(failure?.error ?? 'Something went wrong. Please try again.')
  }
  return (await response.json()) as T
}

/** URL ของไฟล์ที่ backend ส่งมาเป็น path สัมพัทธ์ (เช่น รูปโปรไฟล์ ไฟล์แนบ) ต่อกับที่อยู่ backend ให้ใช้ใน <img src> ได้ */
export const fileUrl = (path: string | null): string | null => (path ? `${API_BASE}${path}` : null)

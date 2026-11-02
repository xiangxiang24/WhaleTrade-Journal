// ไฟล์แนบของโน้ต (ตาราง NoteAttachment ใน database.md)
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024
export const FILE_MAX_BYTES = 25 * 1024 * 1024

export type AttachmentKind = 'image' | 'file'

export type UploadedAttachment = {
  /** ที่อยู่ไฟล์ที่ใช้แสดง/ดาวน์โหลด */
  url: string
  name: string
  size: number
  mime: string
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// อัปโหลดไฟล์แนบ (ยังเป็นข้อมูลจำลอง: อ่านเป็น data URL เก็บอยู่ในเนื้อโน้ตในหน่วยความจำ)
// ตอนต่อ backend ให้ส่งไฟล์แบบ multipart ไปเก็บในโฟลเดอร์ข้อมูลของแอป (userData/attachments) แล้วคืน URL ของไฟล์
//   const body = new FormData(); body.append('file', file); body.append('kind', kind)
//   const response = await fetch('/api/attachments', { method: 'POST', body })
//   if (!response.ok) throw new Error('Could not upload this file.')
//   return (await response.json()) as UploadedAttachment
export async function uploadAttachment(file: File, kind: AttachmentKind): Promise<UploadedAttachment> {
  const limit = kind === 'image' ? IMAGE_MAX_BYTES : FILE_MAX_BYTES
  if (file.size > limit) {
    throw new Error(`This ${kind} is too large. The limit is ${formatBytes(limit)}.`)
  }
  if (kind === 'image' && !file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read this file.'))
    reader.readAsDataURL(file)
  })
  return { url, name: file.name, size: file.size, mime: file.type || 'application/octet-stream' }
}

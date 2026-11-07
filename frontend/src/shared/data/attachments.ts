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

/** ตรวจขนาด/ชนิดไฟล์ก่อนส่งขึ้น backend (backend ตรวจซ้ำอีกชั้น) ไม่ผ่าน = throw Error พร้อมข้อความที่จะแสดง */
export function validateAttachment(file: File, kind: AttachmentKind) {
  const limit = kind === 'image' ? IMAGE_MAX_BYTES : FILE_MAX_BYTES
  if (file.size > limit) {
    throw new Error(`This ${kind} is too large. The limit is ${formatBytes(limit)}.`)
  }
  if (kind === 'image' && !file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }
}

/** ฟังก์ชันอัปโหลดที่หน้าจอส่งให้ตัวแก้ไข (ผูกกับโน้ตที่มีอยู่แล้ว) */
export type UploadAttachment = (file: File, kind: AttachmentKind) => Promise<UploadedAttachment>

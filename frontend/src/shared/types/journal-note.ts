import type { Emotion } from '../emotion/emotions'

/** โน้ต 1 รายการที่ backend ส่งมา (รูปแบบเดียวกับตาราง Note ใน database.md; createdAt เป็น ISO UTC) */
export type JournalNote = {
  id: number
  /** ว่างได้ ถ้าว่างหน้าจอแสดงชื่อเริ่มต้น */
  title: string | null
  content: string
  emotion: Emotion | null
  createdAt: string
}

/** โน้ตในถังขยะ (Note.deletedAt มีค่า) */
export type TrashedNote = JournalNote & {
  /** วันที่ย้ายเข้าถังขยะ (ISO UTC) */
  deletedAt: string
}

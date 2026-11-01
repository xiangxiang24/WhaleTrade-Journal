import type { Emotion } from '../emotion/emotions'

/** ค่าที่ผู้ใช้กรอกในฟอร์มโน้ต (ตรงกับฟิลด์ที่เขียนลงตาราง Note: title, content, emotion) */
export type NoteFormValues = {
  /** ว่างได้ ถ้าว่างระบบแสดงชื่อเริ่มต้น */
  title: string
  /** บังคับกรอก */
  content: string
  /** null = ไม่ระบุอารมณ์ */
  emotion: Emotion | null
}

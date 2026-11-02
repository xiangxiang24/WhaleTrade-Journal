/** การเตือน (รูปเดียวกับตาราง Reminder) */
export type Reminder = {
  id: number
  title: string
  description: string | null
  /** เวลาที่เตือน ISO UTC แปลงตามเขตเวลาผู้ใช้ตอนแสดง */
  remindAt: string
  done: boolean
  /** เวลาที่ติ๊กเสร็จ (ISO UTC) ใช้แสดง "Done 20 Sep" */
  doneAt: string | null
}

/** task checkbox ในการ์ด Gentle To-Dos (ตาราง Task) */
export type Task = {
  id: number
  text: string
  done: boolean
  createdAt: string
}

/** ค่าจากฟอร์มตั้ง/แก้การเตือน */
export type ReminderFormValues = {
  title: string
  description: string
  /** วันที่ท้องถิ่นของผู้ใช้ YYYY-MM-DD */
  date: string
  /** เวลาท้องถิ่นของผู้ใช้ HH:mm */
  time: string
}

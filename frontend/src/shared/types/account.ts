export type Language = 'th' | 'en'

/** บัญชีผู้ใช้ที่ล็อกอินอยู่ (ตาราง User ส่วนที่ฝั่งหน้าจอใช้ ไม่รวม passwordHash / recoveryCode) */
export type Account = {
  /** ชื่อเต็มที่กรอกตอนสมัคร (ชื่อใหญ่ข้าง avatar ในหน้า Setting) */
  fullName: string
  /** ชื่อที่แสดงทั่วแอป (Sidebar, TopBar) ตัวอักษรย่อใน avatar ได้จากชื่อนี้ */
  displayName: string
  email: string
  /** รูปโปรไฟล์ (data URL ในข้อมูลจำลอง; ของจริงเป็น path ไฟล์ใน userData) ว่าง = แสดงตัวอักษรย่อ */
  avatarUrl: string | null
  language: Language
  /** รหัส IANA เช่น Asia/Bangkok */
  timezone: string
}

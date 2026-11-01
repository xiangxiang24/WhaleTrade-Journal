/** รหัสเมนูใน Sidebar (ตรงกับหน้าหลักของแอป) */
export type SidebarKey =
  | 'my-journals'
  | 'portfolio'
  | 'reminder'
  | 'saved-plan'
  | 'target-amount'
  | 'trash'
  | 'setting'

/** ผู้ใช้ที่ล็อกอินอยู่ (ตัวอักษรย่อ/รูปใช้ avatarUrl ถ้ามี ไม่มีให้แสดงไอคอนคน) */
export type SidebarUser = {
  displayName: string
  avatarUrl?: string
}

/** คีย์ไอคอนพอร์ต (database.md: Portfolio.icon เลือกจากชุดที่แอปมี ไม่เก็บรูป) */
export type PortfolioIconKey = 'leaf' | 'bag' | 'pot' | 'anchor' | 'gem' | 'landmark'

/**
 * พอร์ตหนึ่งใบ (รูปเดียวกับตาราง Portfolio + ค่าที่คำนวณจาก Transaction)
 * จำนวนเงินเป็นบาทเต็มหน่วยเพื่อความง่ายของข้อมูลจำลอง (ใน DB เก็บเป็นสตางค์ BigInt)
 */
export type Portfolio = {
  id: number
  name: string
  /** ข้อความสั้นใต้ชื่อ เช่น "Anchor Portfolio" */
  tagline: string | null
  icon: PortfolioIconKey
  /** เป้าหมายต่อปี (THB) ว่าง = ยังไม่ตั้ง Goal */
  annualGoal: number | null
  /** ยอดที่ถึงเป้าแล้ว = Run-Rate (ปันผลที่บันทึกใน 12 เดือนล่าสุด) */
  reached: number
  /** Total recorded DCA */
  totalDca: number
  /** จำนวน transaction ทั้งหมด */
  entries: number
  /** วันที่อัปเดตล่าสุด (ISO UTC) */
  updatedAt: string
  /** มีค่า = อยู่ในถังขยะ (หน้ารายการไม่แสดง) */
  deletedAt: string | null
}

/** ค่าจากฟอร์มสร้าง/แก้พอร์ต */
export type PortfolioFormValues = {
  name: string
  tagline: string
  icon: PortfolioIconKey
  annualGoal: number | null
}

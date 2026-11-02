export type TransactionType = 'buy' | 'sell' | 'dividend'

/** หุ้น/กองทุนจากรายการกลาง (ตาราง Asset: อ่านอย่างเดียว ใช้ร่วมกันทั้งแอป) */
export type Asset = {
  id: number
  ticker: string
  name: string
  type: 'stock' | 'fund'
  /** เช่น SET, US, TH-FUND */
  market: string
  /** หมวดอุตสาหกรรม ใช้ทำแท็บกรอง (ว่างได้) */
  sector: string | null
}

/**
 * รายการใน Port log (รูปเดียวกับตาราง Transaction)
 * จำนวนเงินเป็นบาทเต็มหน่วย ราคา/หน่วยเป็นตัวเลขทศนิยมตามจริงเพื่อความง่ายของข้อมูลจำลอง (ใน DB เก็บเป็นจำนวนเต็ม)
 */
export type Transaction = {
  id: number
  portfolioId: number
  assetId: number
  type: TransactionType
  /** วันที่ตามปฏิทิน YYYY-MM-DD */
  date: string
  /** ราคาต่อหน่วย (ซื้อ/ขาย) */
  price: number | null
  /** ซื้อ/ขาย = หน่วยที่ซื้อ/ขาย, ปันผล = หน่วยที่ถืออยู่ตอนรับ (ข้อมูลประกอบ) */
  units: number | null
  fee: number | null
  /** ยอดปันผล (ปันผลเท่านั้น) */
  amount: number | null
  note: string | null
  tag: string | null
  /** ISO UTC */
  updatedAt: string
}

/** ค่าจากฟอร์มเพิ่ม/แก้ transaction */
export type TransactionFormValues = {
  type: TransactionType
  date: string
  assetId: number
  price: number | null
  units: number | null
  fee: number | null
  amount: number | null
  note: string
  tag: string
}

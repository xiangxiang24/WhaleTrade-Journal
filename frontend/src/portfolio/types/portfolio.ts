export type PortfolioLoadStatus = 'loading' | 'ready' | 'error'

/** ข้อความแจ้งเตือนชั่วคราวท้ายหน้า (เช่น ย้ายพอร์ตไปถังขยะ + ปุ่ม Undo) */
export type PortfolioToast = {
  id: number
  message: string
  /** พอร์ตที่เพิ่งย้ายไปถังขยะ (มี = แสดงปุ่ม Undo) */
  undoId?: number
}

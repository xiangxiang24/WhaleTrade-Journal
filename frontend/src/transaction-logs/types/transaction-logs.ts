export type DetailLoadStatus = 'loading' | 'ready' | 'error' | 'missing'

/** ค่าเฉลี่ยตลาด SET ที่ใช้เทียบ Yield on Cost (%) แอปออฟไลน์จึงเป็นค่าคงที่ในไฟล์ตั้งค่า (database.md หัวข้อ 4) */
export const SET_INDEX_AVG_YIELD = 3.2

/** ข้อความแจ้งผลชั่วคราว (ใช้ type เดียวกับหน้า Portfolio) */
export type { PortfolioToast as DetailToast } from '../../portfolio/types/portfolio'

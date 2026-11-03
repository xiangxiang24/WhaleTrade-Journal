import type { Emotion } from '../../shared/emotion/emotions'

/** ตัวกรองอารมณ์: 'all' = ทั้งหมด, 'none' = โน้ตที่ไม่ระบุอารมณ์ */
export type MoodFilterValue = Emotion | 'all' | 'none'

export type JournalLoadStatus = 'loading' | 'ready' | 'error'

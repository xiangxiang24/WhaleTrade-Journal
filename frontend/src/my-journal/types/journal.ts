import type { Emotion } from '../../shared/emotion/emotions'

/** ตัวกรองอารมณ์: 'all' = ทั้งหมด */
export type MoodFilterValue = Emotion | 'all'

export type JournalLoadStatus = 'loading' | 'ready' | 'error'

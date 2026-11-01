/** รหัสอารมณ์ตรงกับ Note.emotion ใน database (null = ไม่ระบุ) */
export type Emotion = 'overjoyed' | 'happy' | 'neutral' | 'worried' | 'sad'

type EmotionMeta = {
  id: Emotion
  /** ชื่อที่แสดง (ยังไม่ผ่านระบบแปลภาษา) */
  label: string
}

// ลำดับตรงตาม database.md / design rules หัวข้อ 8
export const EMOTIONS: EmotionMeta[] = [
  { id: 'overjoyed', label: 'Overjoyed' },
  { id: 'happy', label: 'Happy' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'worried', label: 'Worried' },
  { id: 'sad', label: 'Sad' },
]

export const NO_EMOTION_LABEL = 'Unspecified'

import type { NoteFormValues } from '../../shared/types/note-form'
import type { JournalNote } from '../types/journal'

// ข้อมูลจำลองไว้ดู UI ครบทุกอารมณ์ (จำนวนตรง Figma: Overjoyed 2, Happy 5, Neutral 3, Worried 1, Sad 1)
const MOCK_NOTES: JournalNote[] = [
  {
    id: 12,
    title: 'Today Journal',
    content:
      'Held through the dip today. The dividend coverage is still healthy and nothing about the business has changed. Writing this down so I remember why I own it.',
    emotion: 'overjoyed',
    createdAt: '2026-09-21T14:31:00Z',
  },
  {
    id: 11,
    title: 'Today Journal',
    content:
      'Another quarterly dividend arrived on time. Reinvested into the same fund and kept the monthly DCA schedule exactly as planned.',
    emotion: 'happy',
    createdAt: '2026-09-18T09:05:00Z',
  },
  {
    id: 10,
    title: 'Why I bought the bank stock',
    content:
      'Stable payout ratio for ten years, low debt, and a business model I understand. I will sell only if the dividend is cut or the model breaks, not because the price moves.',
    emotion: 'overjoyed',
    createdAt: '2026-09-15T03:20:00Z',
  },
  {
    id: 9,
    title: 'Today Journal',
    content:
      'Reviewed the portfolio goal. Progress is a little ahead of the yearly plan. No need to change anything this month.',
    emotion: 'happy',
    createdAt: '2026-09-11T12:44:00Z',
  },
  {
    id: 8,
    title: 'Quiet week',
    content:
      'Nothing happened this week and that is fine. Market noise was loud but my reasons did not change, so I did nothing.',
    emotion: 'neutral',
    createdAt: '2026-09-08T15:10:00Z',
  },
  {
    id: 7,
    title: 'Today Journal',
    content:
      'Felt tempted to check prices every hour. Closed the app instead and went for a walk. The plan is long term, the daily number is not.',
    emotion: 'worried',
    createdAt: '2026-09-04T17:02:00Z',
  },
  {
    id: 6,
    title: 'Today Journal',
    content:
      'Added a small position in the REIT fund. Yield on cost is improving slowly, which is exactly what I wanted from it.',
    emotion: 'happy',
    createdAt: '2026-08-30T08:15:00Z',
  },
  {
    id: 5,
    title: 'Rebalance notes',
    content:
      'Trimmed nothing, added nothing. Allocation is within the range I set last year, so I just recorded the numbers.',
    emotion: 'neutral',
    createdAt: '2026-08-24T10:40:00Z',
  },
  {
    id: 4,
    title: 'Today Journal',
    content:
      'A company I follow lowered its guidance. Not a reason to sell yet but I wrote down what would change my mind.',
    emotion: 'neutral',
    createdAt: '2026-08-19T13:25:00Z',
  },
  {
    id: 3,
    title: 'Today Journal',
    content:
      'Sold a position that no longer fits my rules and it hurt a little. Recording it honestly so I learn from it next time.',
    emotion: 'sad',
    createdAt: '2026-08-12T16:50:00Z',
  },
  {
    id: 2,
    title: 'Dividend month',
    content:
      'Three dividends landed this month. Seeing the run-rate climb makes the boring routine feel worth it.',
    emotion: 'happy',
    createdAt: '2026-08-05T07:30:00Z',
  },
  {
    id: 1,
    title: 'First note',
    content:
      'Starting this journal to keep my reasons next to my decisions. Future me, be patient and keep compounding.',
    emotion: 'happy',
    createdAt: '2026-07-28T11:00:00Z',
  },
]

const MOCK_DELAY_MS = 500

// ดึงโน้ตทั้งหมดของผู้ใช้ (ยังเป็นข้อมูลจำลอง)
// ตอนต่อ backend ให้แทนที่เนื้อฟังก์ชันด้วยการเรียก API เช่น
//   const response = await fetch('/api/notes')
//   if (!response.ok) throw new Error('Could not load your journals.')
//   return (await response.json()) as JournalNote[]
// ส่วนอื่นของหน้าไม่ต้องแก้ เพราะใช้ผ่าน hook `useJournalNotes` เท่านั้น
export async function fetchJournalNotes(): Promise<JournalNote[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
  return MOCK_NOTES
}

// สร้างโน้ตใหม่ (ยังเป็นข้อมูลจำลอง: เก็บในหน่วยความจำของหน้า ไม่คงอยู่หลังรีเฟรช)
// ตอนต่อ backend ให้ POST แล้วคืนโน้ตที่เซิร์ฟเวอร์สร้าง เช่น
//   const response = await fetch('/api/notes', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(values),
//   })
//   if (!response.ok) throw new Error('Could not save your note.')
//   return (await response.json()) as JournalNote
// (backend เติม id, createdAt, userId จาก token และ emotionChangedAt เมื่อมี emotion)
let nextMockId = 100

export async function createJournalNote(values: NoteFormValues): Promise<JournalNote> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
  return {
    id: nextMockId++,
    title: values.title || null,
    content: values.content,
    emotion: values.emotion,
    createdAt: new Date().toISOString(),
  }
}

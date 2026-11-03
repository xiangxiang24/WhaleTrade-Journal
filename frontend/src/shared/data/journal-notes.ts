import type { JournalNote, TrashedNote } from '../types/journal-note'
import type { NoteFormValues } from '../types/note-form'

// ข้อมูลจำลองไว้ดู UI ครบทุกอารมณ์ (จำนวนตรง Figma: Overjoyed 2, Happy 5, Neutral 3, Worried 1, Sad 1)
// ที่เก็บข้อมูลจำลองในหน่วยความจำ: ใช้ร่วมกันทุกหน้า จึงเห็นการสร้าง/แก้/ลบข้ามหน้าได้ (รีเฟรชแล้วกลับเป็นค่าเริ่มต้น)
let store: JournalNote[] = [
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

// โน้ตในถังขยะ (Note.deletedAt มีค่า) ไม่ปนกับ store เพื่อให้ไม่โผล่ในไทม์ไลน์ ตัวกรองอารมณ์ และการค้นหา
// id ไม่ซ้ำกับโน้ตปกติ เพื่อให้กู้คืนกลับไปที่เดิมได้
let trashed: TrashedNote[] = [
  {
    id: 15,
    title: 'Should I sell the tech fund?',
    content:
      'Everyone on the forum is panicking about rates. I feel the urge to sell, but my plan says hold for ten years. Writing this so I do not act on fear.',
    emotion: 'worried',
    createdAt: '2026-09-02T10:12:00Z',
    deletedAt: '2026-10-20T08:30:00Z',
  },
  {
    id: 14,
    title: null,
    content: 'Quick note: bought a little extra of the REIT today because it looked cheap. No real reason written down yet.',
    emotion: null,
    createdAt: '2026-08-27T13:45:00Z',
    deletedAt: '2026-10-14T16:05:00Z',
  },
  {
    id: 13,
    title: 'Missed the dividend date',
    content:
      'I forgot the ex-dividend date and bought the day after. A small lesson: set a reminder two days before the date next time, and check the calendar every Sunday.',
    emotion: 'sad',
    createdAt: '2026-08-15T09:20:00Z',
    deletedAt: '2026-10-02T11:00:00Z',
  },
  {
    id: 16,
    title: 'First full year of DCA',
    content:
      'Twelve straight months without skipping a deposit. The balance is not big yet, but the habit finally feels automatic and calm.',
    emotion: 'overjoyed',
    createdAt: '2026-07-30T18:00:00Z',
    deletedAt: '2026-09-25T07:40:00Z',
  },
]

const MOCK_DELAY_MS = 400

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ===== โน้ต (ตาราง Note) =====
// ตอนต่อ backend ให้แทนที่เนื้อฟังก์ชันด้วยการเรียก API (ตัวอย่างอยู่ในคอมเมนต์ของแต่ละฟังก์ชัน)
// ส่วนอื่นของแอปใช้ผ่านฟังก์ชันเหล่านี้เท่านั้น จึงไม่ต้องแก้ที่อื่น

// ดึงโน้ตทั้งหมดของผู้ใช้
//   const response = await fetch('/api/notes')
//   if (!response.ok) throw new Error('Could not load your journals.')
//   return (await response.json()) as JournalNote[]
export async function fetchJournalNotes(): Promise<JournalNote[]> {
  await delay(500)
  return [...store]
}

// ดึงโน้ต 1 รายการ (ไม่พบ = null)   GET /api/notes/:id
export async function fetchJournalNote(id: number): Promise<JournalNote | null> {
  await delay()
  return store.find((note) => note.id === id) ?? null
}

// สร้างโน้ตใหม่ แล้วคืนโน้ตที่สร้าง   POST /api/notes
// (backend เติม id, createdAt, userId จาก token และ emotionChangedAt เมื่อมี emotion)
export async function createJournalNote(values: NoteFormValues): Promise<JournalNote> {
  await delay()
  const created: JournalNote = {
    id: [...store, ...trashed].reduce((max, note) => Math.max(max, note.id), 0) + 1,
    title: values.title || null,
    content: values.content,
    emotion: values.emotion,
    createdAt: new Date().toISOString(),
  }
  store = [created, ...store]
  return created
}

// แก้โน้ต แล้วคืนโน้ตที่อัปเดต   PUT /api/notes/:id
// (backend ตั้ง emotionChangedAt เมื่ออารมณ์เปลี่ยน และ updatedAt)
export async function updateJournalNote(id: number, values: NoteFormValues): Promise<JournalNote> {
  await delay()
  const current = store.find((note) => note.id === id)
  if (!current) throw new Error('This journal no longer exists.')
  const updated: JournalNote = {
    ...current,
    title: values.title || null,
    content: values.content,
    emotion: values.emotion,
  }
  store = store.map((note) => (note.id === id ? updated : note))
  return updated
}

// ลบโน้ต = ย้ายไปถังขยะ (Soft delete ตั้ง Note.deletedAt)   DELETE /api/notes/:id (backend ลบ NoteDraft ที่ผูกอยู่ตาม)
export async function deleteJournalNote(id: number): Promise<void> {
  await delay()
  const current = store.find((note) => note.id === id)
  store = store.filter((note) => note.id !== id)
  if (current) trashed = [{ ...current, deletedAt: new Date().toISOString() }, ...trashed]
  drafts.delete(id)
}

// ===== ถังขยะของโน้ต =====
// GET /api/notes?trashed=true (ลบล่าสุดก่อน)
export async function fetchTrashedNotes(): Promise<TrashedNote[]> {
  await delay()
  return [...trashed].sort((a, b) => b.deletedAt.localeCompare(a.deletedAt))
}

// POST /api/notes/:id/restore กลับไปอยู่ในไทม์ไลน์ (เรียงตามวันที่เขียนอยู่แล้ว จึงอยู่ตำแหน่งเดิม)
export async function restoreJournalNote(id: number): Promise<JournalNote> {
  await delay()
  const current = trashed.find((note) => note.id === id)
  if (!current) throw new Error('This journal is no longer in the trash.')
  const { deletedAt, ...note } = current
  void deletedAt
  trashed = trashed.filter((item) => item.id !== id)
  store = [...store, note].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return note
}

// DELETE /api/notes/:id?permanent=true ลบถาวร (ผู้ใช้กดเองเท่านั้น)
export async function purgeJournalNote(id: number): Promise<void> {
  await delay()
  if (!trashed.some((note) => note.id === id)) throw new Error('This journal is no longer in the trash.')
  trashed = trashed.filter((note) => note.id !== id)
}

// DELETE /api/notes/trash ล้างถังขยะของโน้ต แล้วคืนจำนวนที่ลบ
export async function emptyJournalTrash(): Promise<number> {
  await delay()
  const count = trashed.length
  trashed = []
  return count
}

// ===== ฉบับร่างที่บันทึกอัตโนมัติ (ตาราง NoteDraft) =====
// ผู้ใช้มีร่างได้ 1 อันต่อโน้ต   GET/PUT/DELETE /api/notes/:id/draft
export type NoteDraft = {
  values: NoteFormValues
  /** เวลาที่บันทึกอัตโนมัติล่าสุด (มิลลิวินาที) */
  savedAt: number
}

const drafts = new Map<number, NoteDraft>()

export async function loadNoteDraft(noteId: number): Promise<NoteDraft | null> {
  await delay(150)
  return drafts.get(noteId) ?? null
}

export async function saveNoteDraft(noteId: number, values: NoteFormValues): Promise<number> {
  await delay(250)
  const savedAt = Date.now()
  drafts.set(noteId, { values, savedAt })
  return savedAt
}

export async function deleteNoteDraft(noteId: number): Promise<void> {
  drafts.delete(noteId)
}

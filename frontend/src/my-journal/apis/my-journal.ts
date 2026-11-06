import { downloadFile, request } from '../../shared/apis/client'
import type { JournalNote } from '../../shared/types/journal-note'

// GET /api/notes  (ใหม่ → เก่า เฉพาะโน้ตที่ไม่อยู่ในถังขยะ)
export const fetchJournalNotes = () => request<JournalNote[]>('/api/notes')

// GET /api/notes/export.csv  (โน้ตทั้งหมด ไม่รวมถังขยะ)
export const exportJournalsCsv = () => downloadFile('/api/notes/export.csv', 'journals.csv')

import { request, uploadFile } from '../../shared/apis/client'
import type { AttachmentKind, UploadedAttachment } from '../../shared/data/attachments'
import type { JournalNote } from '../../shared/types/journal-note'
import type { NoteFormValues } from '../../shared/types/note-form'

export type NoteDraft = { values: NoteFormValues; savedAt: number }

// GET /api/notes/:id  (ไม่พบ = Error → หน้าจอแสดง "ไม่พบ")
export const fetchJournalNote = (id: number) => request<JournalNote>(`/api/notes/${id}`)

// POST /api/notes
export const createJournalNote = (values: NoteFormValues) =>
  request<JournalNote>('/api/notes', { method: 'POST', body: values })

// PUT /api/notes/:id
export const updateJournalNote = (id: number, values: NoteFormValues) =>
  request<JournalNote>(`/api/notes/${id}`, { method: 'PUT', body: values })

// DELETE /api/notes/:id  (ย้ายไปถังขยะ และลบฉบับร่างของโน้ตนั้น)
export const deleteJournalNote = (id: number) => request<void>(`/api/notes/${id}`, { method: 'DELETE' })

// GET /api/notes/:id/draft  (ไม่มีร่าง = null)
export const loadNoteDraft = (noteId: number) => request<NoteDraft | null>(`/api/notes/${noteId}/draft`)

// PUT /api/notes/:id/draft  (คืนเวลาที่บันทึก เป็นมิลลิวินาที)
export const saveNoteDraft = async (noteId: number, values: NoteFormValues) =>
  (await request<{ savedAt: number }>(`/api/notes/${noteId}/draft`, { method: 'PUT', body: values })).savedAt

// DELETE /api/notes/:id/draft
export const deleteNoteDraft = (noteId: number) => request<void>(`/api/notes/${noteId}/draft`, { method: 'DELETE' })

// POST /api/notes/:id/attachments?kind=&name=  (ไฟล์เก็บในโฟลเดอร์ข้อมูลของแอป คืน URL ที่เซ็นลายเซ็นแล้ว)
export const uploadAttachment = (noteId: number, file: File, kind: AttachmentKind) =>
  uploadFile<UploadedAttachment>(`/api/notes/${noteId}/attachments?kind=${kind}&name=${encodeURIComponent(file.name)}`, file)

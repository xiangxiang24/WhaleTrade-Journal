import type { NoteFormValues } from '../../shared/types/note-form'

export type EditorLoadStatus = 'loading' | 'ready' | 'not-found' | 'error'

/** สถานะฉบับร่าง: idle = ไม่มีการเปลี่ยนแปลงค้าง, saving = กำลังบันทึกอัตโนมัติ, saved = บันทึกร่างแล้ว */
export type DraftState = 'idle' | 'saving' | 'saved'

export type EditorValues = NoteFormValues

import { useCallback, useEffect, useState } from 'react'
import {
  deleteJournalNote,
  deleteNoteDraft,
  fetchJournalNote,
  loadNoteDraft,
  saveNoteDraft,
  updateJournalNote,
} from '../../shared/data/journal-notes'
import type { JournalNote } from '../../shared/types/journal-note'
import type { DraftState, EditorLoadStatus, EditorValues } from './journaling'

const EMPTY: EditorValues = { title: '', content: '', emotion: null }
const AUTOSAVE_DELAY_MS = 800

function toValues(note: JournalNote): EditorValues {
  return { title: note.title ?? '', content: note.content, emotion: note.emotion }
}

function isSame(a: EditorValues, b: EditorValues) {
  return a.title === b.title && a.content === b.content && a.emotion === b.emotion
}

// ตัวแก้โน้ต 1 เล่ม: โหลดโน้ต + ฉบับร่างค้าง, บันทึกร่างอัตโนมัติเมื่อมีการแก้, บันทึก/ยกเลิก/ลบ
export function useJournalEditor(noteId: number) {
  const [note, setNote] = useState<JournalNote | null>(null)
  const [status, setStatus] = useState<EditorLoadStatus>('loading')
  const [values, setValues] = useState<EditorValues>(EMPTY)
  const [draftState, setDraftState] = useState<DraftState>('idle')
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null)
  const [attempt, setAttempt] = useState(0)

  // โหลดโน้ตและฉบับร่างที่ค้างอยู่ (ถ้ามีให้กู้คืนมาแสดงแทนค่าที่บันทึกไว้)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [found, draft] = await Promise.all([fetchJournalNote(noteId), loadNoteDraft(noteId)])
        if (cancelled) return
        if (!found) {
          setStatus('not-found')
          return
        }
        setNote(found)
        setValues(draft ? draft.values : toValues(found))
        if (draft) {
          setDraftState('saved')
          setDraftSavedAt(draft.savedAt)
        }
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [noteId, attempt])

  const baseline = note ? toValues(note) : EMPTY
  const dirty = note !== null && !isSame(values, baseline)

  // บันทึกร่างอัตโนมัติหลังหยุดพิมพ์ 0.8 วินาที
  useEffect(() => {
    if (status !== 'ready' || !dirty) return
    const timer = setTimeout(async () => {
      setDraftState('saving')
      try {
        const savedAt = await saveNoteDraft(noteId, values)
        setDraftSavedAt(savedAt)
        setDraftState('saved')
      } catch {
        setDraftState('idle')
      }
    }, AUTOSAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [values, dirty, status, noteId])

  const change = useCallback(
    (patch: Partial<EditorValues>) => {
      const next = { ...values, ...patch }
      setValues(next)
      // แก้กลับมาเท่าค่าที่บันทึกไว้ = ไม่มีอะไรเปลี่ยน ลบร่างทิ้ง
      if (note && isSame(next, toValues(note))) {
        void deleteNoteDraft(noteId)
        setDraftState('idle')
        setDraftSavedAt(null)
      }
    },
    [values, note, noteId],
  )

  // Save Changes: เขียนลงโน้ต แล้วลบร่าง (ถ้าไม่สำเร็จ throw Error ให้ผู้เรียกแสดงข้อความ)
  const save = useCallback(async () => {
    const updated = await updateJournalNote(noteId, {
      title: values.title.trim(),
      content: values.content.trim(),
      emotion: values.emotion,
    })
    await deleteNoteDraft(noteId)
    setNote(updated)
    setValues(toValues(updated))
    setDraftState('idle')
    setDraftSavedAt(null)
  }, [noteId, values])

  // Cancel: ทิ้งการแก้ไขและลบร่าง ค่าในโน้ตไม่เปลี่ยน
  const discard = useCallback(async () => {
    await deleteNoteDraft(noteId)
  }, [noteId])

  // Delete journal: ลบโน้ตถาวร (ถ้าไม่สำเร็จ throw Error)
  const remove = useCallback(async () => {
    await deleteJournalNote(noteId)
  }, [noteId])

  const reload = useCallback(() => {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }, [])

  return { status, values, dirty, draftState, draftSavedAt, change, save, discard, remove, reload }
}

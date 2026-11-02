import { useCallback, useEffect, useState } from 'react'
import { createJournalNote, fetchJournalNotes } from '../../shared/data/journal-notes'
import type { JournalNote } from '../../shared/types/journal-note'
import type { NoteFormValues } from '../../shared/types/note-form'
import type { JournalLoadStatus } from './journal'

// โหลดโน้ตของผู้ใช้ พร้อมสถานะ loading / ready / error, reload และ addNote
export function useJournalNotes() {
  const [notes, setNotes] = useState<JournalNote[]>([])
  const [status, setStatus] = useState<JournalLoadStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchJournalNotes()
      .then((result) => {
        if (cancelled) return
        setNotes(result)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const reload = useCallback(() => {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }, [])

  // สร้างโน้ตใหม่แล้วเพิ่มเข้าหัวรายการ (เรียงใหม่ → เก่าอยู่แล้ว)
  const addNote = useCallback(async (values: NoteFormValues) => {
    const created = await createJournalNote(values)
    setNotes((current) => [created, ...current])
  }, [])

  return { notes, status, reload, addNote }
}

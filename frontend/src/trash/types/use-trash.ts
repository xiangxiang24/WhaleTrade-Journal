import { useCallback, useEffect, useState } from 'react'
import {
  emptyJournalTrash,
  fetchTrashedNotes,
  purgeJournalNote,
  restoreJournalNote,
} from '../../shared/data/journal-notes'
import {
  emptyPortfolioTrash,
  fetchTrashedPortfolios,
  purgePortfolio,
  restorePortfolio,
} from '../../shared/data/portfolios'
import type { TrashedNote } from '../../shared/types/journal-note'
import type { TrashedPortfolio } from '../../shared/types/portfolio'
import type { TrashLoadStatus } from './trash'

// โหลดโน้ต + พอร์ตในถังขยะ (ลบล่าสุดก่อน) พร้อมกู้คืน / ลบถาวร / ล้างถังขยะ แยกตามแท็บ
export function useTrash() {
  const [notes, setNotes] = useState<TrashedNote[]>([])
  const [portfolios, setPortfolios] = useState<TrashedPortfolio[]>([])
  const [status, setStatus] = useState<TrashLoadStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchTrashedNotes(), fetchTrashedPortfolios()])
      .then(([loadedNotes, loadedPortfolios]) => {
        if (cancelled) return
        setNotes(loadedNotes)
        setPortfolios(loadedPortfolios)
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

  const restoreNote = useCallback(async (id: number) => {
    await restoreJournalNote(id)
    setNotes((current) => current.filter((note) => note.id !== id))
  }, [])

  const purgeNote = useCallback(async (id: number) => {
    await purgeJournalNote(id)
    setNotes((current) => current.filter((note) => note.id !== id))
  }, [])

  const emptyNotes = useCallback(async () => {
    await emptyJournalTrash()
    setNotes([])
  }, [])

  const restoreOnePortfolio = useCallback(async (id: number) => {
    await restorePortfolio(id)
    setPortfolios((current) => current.filter((portfolio) => portfolio.id !== id))
  }, [])

  const purgeOnePortfolio = useCallback(async (id: number) => {
    await purgePortfolio(id)
    setPortfolios((current) => current.filter((portfolio) => portfolio.id !== id))
  }, [])

  const emptyPortfolios = useCallback(async () => {
    await emptyPortfolioTrash()
    setPortfolios([])
  }, [])

  return {
    notes,
    portfolios,
    status,
    reload,
    restoreNote,
    purgeNote,
    emptyNotes,
    restorePortfolio: restoreOnePortfolio,
    purgePortfolio: purgeOnePortfolio,
    emptyPortfolios,
  }
}

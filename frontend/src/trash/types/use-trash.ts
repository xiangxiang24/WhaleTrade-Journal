import { useCallback, useEffect, useState } from 'react'
import {
  emptyJournalTrash,
  emptyPlanTrash,
  emptyPortfolioTrash,
  fetchTrashedNotes,
  fetchTrashedPlans,
  fetchTrashedPortfolios,
  purgeCalcPlan,
  purgeJournalNote,
  purgePortfolio,
  restoreCalcPlan,
  restoreJournalNote,
  restorePortfolio,
} from '../apis/trash'
import { fetchPortfolioNames } from '../../saved-plan/apis/saved-plan'
import type { TrashedCalcPlan } from '../../shared/types/calc-plan'
import type { TrashedNote } from '../../shared/types/journal-note'
import type { TrashedPortfolio } from '../../shared/types/portfolio'
import type { TrashLoadStatus } from './trash'

// โหลดโน้ต + พอร์ตในถังขยะ (ลบล่าสุดก่อน) พร้อมกู้คืน / ลบถาวร / ล้างถังขยะ แยกตามแท็บ
export function useTrash() {
  const [notes, setNotes] = useState<TrashedNote[]>([])
  const [portfolios, setPortfolios] = useState<TrashedPortfolio[]>([])
  const [plans, setPlans] = useState<TrashedCalcPlan[]>([])
  const [names, setNames] = useState<Map<number, string>>(new Map())
  const [status, setStatus] = useState<TrashLoadStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchTrashedNotes(), fetchTrashedPortfolios(), fetchTrashedPlans(), fetchPortfolioNames()])
      .then(([loadedNotes, loadedPortfolios, loadedPlans, loadedNames]) => {
        if (cancelled) return
        setNotes(loadedNotes)
        setPortfolios(loadedPortfolios)
        setPlans(loadedPlans)
        setNames(loadedNames)
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

  const restorePlan = useCallback(async (id: number) => {
    await restoreCalcPlan(id)
    setPlans((current) => current.filter((plan) => plan.id !== id))
  }, [])

  const purgePlan = useCallback(async (id: number) => {
    await purgeCalcPlan(id)
    setPlans((current) => current.filter((plan) => plan.id !== id))
  }, [])

  const emptyPlans = useCallback(async () => {
    await emptyPlanTrash()
    setPlans([])
  }, [])

  return {
    notes,
    portfolios,
    plans,
    names,
    status,
    reload,
    restoreNote,
    purgeNote,
    emptyNotes,
    restorePortfolio: restoreOnePortfolio,
    purgePortfolio: purgeOnePortfolio,
    emptyPortfolios,
    restorePlan,
    purgePlan,
    emptyPlans,
  }
}

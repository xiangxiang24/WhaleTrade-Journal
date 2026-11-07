import { useCallback, useEffect, useState } from 'react'
import { deleteCalcPlan, fetchCalcPlans, fetchPortfolioNames, renameCalcPlan } from '../apis/saved-plan'
import type { CalcPlan } from '../../shared/types/calc-plan'
import type { SavedPlanLoadStatus } from './saved-plan'

// โหลดแผนที่บันทึก (ใหม่ → เก่า) พร้อมสถานะ loading / ready / error และการเปลี่ยนชื่อ/ลบ
export function useSavedPlans() {
  const [plans, setPlans] = useState<CalcPlan[]>([])
  const [names, setNames] = useState<Map<number, string>>(new Map())
  const [status, setStatus] = useState<SavedPlanLoadStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchCalcPlans(), fetchPortfolioNames()])
      .then(([result, loadedNames]) => {
        if (cancelled) return
        setPlans(result)
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

  const rename = useCallback(async (id: number, name: string) => {
    const updated = await renameCalcPlan(id, name)
    setPlans((current) => current.map((plan) => (plan.id === id ? updated : plan)))
  }, [])

  const remove = useCallback(async (id: number) => {
    await deleteCalcPlan(id)
    setPlans((current) => current.filter((plan) => plan.id !== id))
  }, [])

  return { plans, names, status, reload, rename, remove }
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ASSET_BY_ID } from '../../shared/data/assets'
import { deleteCalcPlan, fetchCalcPlan, renameCalcPlan } from '../../shared/data/calc-plans'
import { calculatePlan } from '../../shared/data/calculate-plan'
import { getPortfolioNames } from '../../shared/data/portfolios'
import type { CalcPlan } from '../../shared/types/calc-plan'
import type { CalcResult } from '../../target-amount/types/target-amount'
import type { PlanDetailStatus } from './saved-plan'

// โหลดแผนเดียว แล้ว "คำนวณใหม่จาก principal, phases, assets" ทุกครั้งที่เปิด (resultAmount ไว้โชว์ในรายการเท่านั้น)
export function usePlanDetail(planId: number) {
  const [plan, setPlan] = useState<CalcPlan | null>(null)
  const [names, setNames] = useState<Map<number, string>>(new Map())
  const [status, setStatus] = useState<PlanDetailStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchCalcPlan(planId)
      .then((found) => {
        if (cancelled) return
        if (!found) {
          setStatus('missing')
          return
        }
        setPlan(found)
        setNames(getPortfolioNames())
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [planId, attempt])

  const reload = useCallback(() => {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }, [])

  // ผลลัพธ์รูปเดียวกับที่หน้า Target Amount ใช้ จึงใช้การ์ดผลลัพธ์ชุดเดียวกันได้
  const result = useMemo<CalcResult | null>(() => {
    if (!plan || plan.assets.length === 0) return null
    const avgYieldPct = plan.assets.reduce((sum, asset) => sum + asset.dividendPct, 0) / plan.assets.length
    const input = { principal: plan.principal, phases: plan.phases, avgYieldPct }
    return {
      output: calculatePlan(input),
      input,
      signature: '',
      avgYieldPct,
      portfolioId: plan.portfolioId,
      assets: plan.assets.map((asset) => ({
        assetId: asset.assetId,
        ticker: ASSET_BY_ID.get(asset.assetId)?.ticker ?? 'Unknown',
        dividendPct: asset.dividendPct,
      })),
    }
  }, [plan])

  const rename = useCallback(
    async (name: string) => {
      setPlan(await renameCalcPlan(planId, name))
    },
    [planId],
  )

  const remove = useCallback(() => deleteCalcPlan(planId), [planId])

  return { plan, names, result, status, reload, rename, remove }
}

import { useCallback, useEffect, useState } from 'react'
import { ASSET_BY_ID } from '../../shared/data/assets'
import { isNotFound } from '../../shared/apis/client'
import { calculatePlan } from '../../target-amount/apis/target-amount'
import { deleteCalcPlan, fetchCalcPlan, fetchPortfolioNames, renameCalcPlan } from '../apis/saved-plan'
import type { CalcPlan } from '../../shared/types/calc-plan'
import type { CalcResult } from '../../target-amount/types/target-amount'
import type { PlanDetailStatus } from './saved-plan'

// โหลดแผนเดียว แล้ว "คำนวณใหม่จาก principal, phases, assets" ทุกครั้งที่เปิด (resultAmount ไว้โชว์ในรายการเท่านั้น)
export function usePlanDetail(planId: number) {
  const [plan, setPlan] = useState<CalcPlan | null>(null)
  const [names, setNames] = useState<Map<number, string>>(new Map())
  const [status, setStatus] = useState<PlanDetailStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  const [result, setResult] = useState<CalcResult | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [found, loadedNames] = await Promise.all([fetchCalcPlan(planId), fetchPortfolioNames()])
        // ผลลัพธ์รูปเดียวกับที่หน้า Target Amount ใช้ จึงใช้การ์ดผลลัพธ์ชุดเดียวกันได้
        let computed: CalcResult | null = null
        if (found.assets.length > 0) {
          const avgYieldPct = found.assets.reduce((sum, asset) => sum + asset.dividendPct, 0) / found.assets.length
          const input = { principal: found.principal, phases: found.phases, avgYieldPct }
          computed = {
            output: await calculatePlan(input),
            input,
            signature: '',
            avgYieldPct,
            portfolioId: found.portfolioId,
            assets: found.assets.map((asset) => ({
              assetId: asset.assetId,
              ticker: ASSET_BY_ID.get(asset.assetId)?.ticker ?? 'Unknown',
              dividendPct: asset.dividendPct,
            })),
          }
        }
        if (cancelled) return
        setPlan(found)
        setNames(loadedNames)
        setResult(computed)
        setStatus('ready')
      } catch (error) {
        if (!cancelled) setStatus(isNotFound(error) ? 'missing' : 'error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [planId, attempt])

  const reload = useCallback(() => {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }, [])

  const rename = useCallback(
    async (name: string) => {
      setPlan(await renameCalcPlan(planId, name))
    },
    [planId],
  )

  const remove = useCallback(() => deleteCalcPlan(planId), [planId])

  return { plan, names, result, status, reload, rename, remove }
}

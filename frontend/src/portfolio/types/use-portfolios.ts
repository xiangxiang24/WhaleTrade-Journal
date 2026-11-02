import { useCallback, useEffect, useState } from 'react'
import {
  createPortfolio,
  fetchPortfolios,
  restorePortfolio,
  trashPortfolio,
  updatePortfolio,
} from '../../shared/data/portfolios'
import type { Portfolio, PortfolioFormValues } from '../../shared/types/portfolio'
import type { PortfolioLoadStatus } from './portfolio'

const byId = (a: Portfolio, b: Portfolio) => a.id - b.id

// โหลดพอร์ตของผู้ใช้ (ไม่รวมที่อยู่ในถังขยะ) พร้อมสถานะ loading / ready / error และการสร้าง/แก้/ย้ายถังขยะ/กู้คืน
export function usePortfolios() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [status, setStatus] = useState<PortfolioLoadStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchPortfolios()
      .then((result) => {
        if (cancelled) return
        setPortfolios(result.sort(byId))
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

  const create = useCallback(async (values: PortfolioFormValues) => {
    const created = await createPortfolio(values)
    setPortfolios((current) => [...current, created].sort(byId))
  }, [])

  const update = useCallback(async (id: number, values: PortfolioFormValues) => {
    const updated = await updatePortfolio(id, values)
    setPortfolios((current) => current.map((portfolio) => (portfolio.id === id ? updated : portfolio)))
  }, [])

  // Soft delete: พอร์ตหายจากหน้ารายการ แต่ transaction ยังอยู่ (กู้คืนได้จากถังขยะ)
  const trash = useCallback(async (id: number) => {
    await trashPortfolio(id)
    setPortfolios((current) => current.filter((portfolio) => portfolio.id !== id))
  }, [])

  const restore = useCallback(async (id: number) => {
    const restored = await restorePortfolio(id)
    setPortfolios((current) => [...current, restored].sort(byId))
  }, [])

  return { portfolios, status, reload, create, update, trash, restore }
}

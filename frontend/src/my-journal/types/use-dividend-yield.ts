import { useEffect, useState } from 'react'
import { fetchPortfolios } from '../../portfolio/apis/portfolio'
import { avgYieldOnCost, holdings } from '../../shared/data/portfolio-math'
import { fetchTransactions } from '../../transaction-logs/apis/transaction-logs'

/**
 * Dividend Yield at Cost รวมทุกพอร์ต (ปันผล 12 เดือนล่าสุด ÷ ต้นทุนของหุ้นที่ยังถืออยู่)
 * undefined = กำลังโหลด, null = ยังไม่มีข้อมูลพอ (ยังไม่มีพอร์ต/ยังไม่เคยบันทึกปันผล) หรือโหลดไม่สำเร็จ
 */
export function useDividendYield() {
  const [value, setValue] = useState<number | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    fetchPortfolios()
      .then((portfolios) => Promise.all(portfolios.map((portfolio) => fetchTransactions(portfolio.id))))
      .then((groups) => {
        const yieldPct = avgYieldOnCost(holdings(groups.flat()))
        if (!cancelled) setValue(yieldPct !== null && yieldPct > 0 ? yieldPct : null)
      })
      .catch(() => {
        if (!cancelled) setValue(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return value
}

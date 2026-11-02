import { useCallback, useEffect, useState } from 'react'
import { fetchPortfolio, updatePortfolio } from '../../shared/data/portfolios'
import { createTransaction, deleteTransaction, fetchTransactions, updateTransaction } from '../../shared/data/transactions'
import type { Portfolio, PortfolioFormValues } from '../../shared/types/portfolio'
import type { Transaction, TransactionFormValues } from '../../shared/types/transaction'
import type { DetailLoadStatus } from './transaction-logs'

const newestFirst = (a: Transaction, b: Transaction) => b.date.localeCompare(a.date) || b.id - a.id

// โหลดพอร์ต + transaction ของพอร์ตนั้น พร้อมสถานะ loading / ready / error / missing และการเพิ่ม/แก้/ลบ/แก้พอร์ต
export function usePortfolioDetail(portfolioId: number) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [status, setStatus] = useState<DetailLoadStatus>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchPortfolio(portfolioId), fetchTransactions(portfolioId)])
      .then(([found, txs]) => {
        if (cancelled) return
        if (!found) {
          setStatus('missing')
          return
        }
        setPortfolio(found)
        setTransactions(txs)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [portfolioId, attempt])

  const reload = useCallback(() => {
    setStatus('loading')
    setAttempt((current) => current + 1)
  }, [])

  const addTransaction = useCallback(
    async (values: TransactionFormValues) => {
      const created = await createTransaction(portfolioId, values)
      setTransactions((current) => [...current, created].sort(newestFirst))
    },
    [portfolioId],
  )

  const editTransaction = useCallback(async (id: number, values: TransactionFormValues) => {
    const updated = await updateTransaction(id, values)
    setTransactions((current) => current.map((tx) => (tx.id === id ? updated : tx)).sort(newestFirst))
  }, [])

  const removeTransaction = useCallback(async (id: number) => {
    await deleteTransaction(id)
    setTransactions((current) => current.filter((tx) => tx.id !== id))
  }, [])

  const editPortfolio = useCallback(
    async (values: PortfolioFormValues) => {
      const updated = await updatePortfolio(portfolioId, values)
      setPortfolio(updated)
    },
    [portfolioId],
  )

  return { portfolio, transactions, status, reload, addTransaction, editTransaction, removeTransaction, editPortfolio }
}

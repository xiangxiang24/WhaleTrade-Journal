import { downloadFile, request } from '../../shared/apis/client'
import type { Transaction, TransactionFormValues } from '../../shared/types/transaction'

// GET /api/portfolios/:id/transactions  (ใหม่ → เก่า)
export const fetchTransactions = (portfolioId: number) =>
  request<Transaction[]>(`/api/portfolios/${portfolioId}/transactions`)

// POST /api/portfolios/:id/transactions
export const createTransaction = (portfolioId: number, values: TransactionFormValues) =>
  request<Transaction>(`/api/portfolios/${portfolioId}/transactions`, { method: 'POST', body: values })

// PUT /api/transactions/:id
export const updateTransaction = (id: number, values: TransactionFormValues) =>
  request<Transaction>(`/api/transactions/${id}`, { method: 'PUT', body: values })

// DELETE /api/transactions/:id
export const deleteTransaction = (id: number) => request<void>(`/api/transactions/${id}`, { method: 'DELETE' })

// GET /api/portfolios/:id/transactions/export.csv
export const exportTransactionsCsv = (portfolioId: number) =>
  downloadFile(`/api/portfolios/${portfolioId}/transactions/export.csv`, 'transactions.csv')

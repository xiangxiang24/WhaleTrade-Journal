import type { TransactionType } from '../../shared/types/transaction'

export const TYPE_LABEL: Record<TransactionType, string> = {
  buy: 'Buy',
  sell: 'Sell',
  dividend: 'Dividend',
}

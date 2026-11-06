import { fromPrice, fromSatang, fromUnits } from './money.js';

type TransactionRow = {
  id: number;
  portfolioId: number;
  assetId: number;
  type: string;
  date: string;
  price: bigint | null;
  units: bigint | null;
  fee: bigint | null;
  amount: bigint | null;
  note: string | null;
  tag: string | null;
  updatedAt: Date;
};

export type TransactionType = 'buy' | 'sell' | 'dividend';

/** รูปเดียวกับ Transaction ฝั่ง frontend (เงินเป็นบาท ราคา/หน่วยเป็นทศนิยมตามจริง) */
export type TransactionDto = {
  id: number;
  portfolioId: number;
  assetId: number;
  type: TransactionType;
  date: string;
  price: number | null;
  units: number | null;
  fee: number | null;
  amount: number | null;
  note: string | null;
  tag: string | null;
  updatedAt: string;
};

export const toTransactionDto = (tx: TransactionRow): TransactionDto => ({
  id: tx.id,
  portfolioId: tx.portfolioId,
  assetId: tx.assetId,
  type: tx.type === 'sell' ? 'sell' : tx.type === 'dividend' ? 'dividend' : 'buy',
  date: tx.date,
  price: tx.price === null ? null : fromPrice(tx.price),
  units: tx.units === null ? null : fromUnits(tx.units),
  fee: tx.fee === null ? null : fromSatang(tx.fee),
  amount: tx.amount === null ? null : fromSatang(tx.amount),
  note: tx.note,
  tag: tx.tag,
  updatedAt: tx.updatedAt.toISOString(),
});

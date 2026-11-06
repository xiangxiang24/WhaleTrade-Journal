import type { AppContext } from '../../context.js';
import { HttpError } from '../../middleware/http-error.js';
import { toCsv } from '../shared/csv.js';
import { optional, toPrice, toSatang, toUnits } from '../shared/money.js';
import { findOwnPortfolio } from '../portfolio/portfolio.js';
import { txAmount } from '../shared/portfolio-math.js';
import { toTransactionDto, type TransactionDto, type TransactionType } from '../shared/transactions.js';

export type TransactionValues = {
  type: TransactionType;
  date: string;
  assetId: number;
  price: number | null;
  units: number | null;
  fee: number | null;
  amount: number | null;
  note: string | null;
  tag: string | null;
};

const NOT_FOUND = 'This transaction no longer exists.';

export function transactionLogsService({ db }: AppContext) {
  /** transaction ไม่มี userId ตรงๆ จึงตรวจสิทธิ์ผ่านพอร์ตของผู้ใช้เสมอ (พอร์ตในถังขยะแก้ไม่ได้) */
  async function ownTransaction(userId: number, id: number) {
    const tx = await db.transaction.findFirst({ where: { id, portfolio: { userId, deletedAt: null } } });
    if (!tx) throw new HttpError(404, NOT_FOUND);
    return tx;
  }

  async function assertAsset(assetId: number) {
    if (!(await db.asset.findUnique({ where: { id: assetId }, select: { id: true } }))) {
      throw new HttpError(400, 'Please choose a stock or fund from the list.');
    }
  }

  const data = (values: TransactionValues) => ({
    assetId: values.assetId,
    type: values.type,
    date: values.date,
    price: optional(values.price, toPrice),
    units: optional(values.units, toUnits),
    fee: optional(values.fee, toSatang),
    amount: optional(values.amount, toSatang),
    note: values.note,
    tag: values.tag,
  });

  /** พอร์ตเปลี่ยน (transaction เพิ่ม/แก้/ลบ) = touch updatedAt ของพอร์ต ใช้เป็น Last updated */
  const touch = (portfolioId: number) => db.portfolio.update({ where: { id: portfolioId }, data: { updatedAt: new Date() } });

  return {
    /** ใหม่ → เก่า */
    async list(userId: number, portfolioId: number): Promise<TransactionDto[]> {
      await findOwnPortfolio(db, userId, portfolioId);
      const rows = await db.transaction.findMany({
        where: { portfolioId },
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
      });
      return rows.map(toTransactionDto);
    },

    async create(userId: number, portfolioId: number, values: TransactionValues): Promise<TransactionDto> {
      await findOwnPortfolio(db, userId, portfolioId);
      await assertAsset(values.assetId);
      const row = await db.transaction.create({ data: { portfolioId, ...data(values) } });
      await touch(portfolioId);
      return toTransactionDto(row);
    },

    async update(userId: number, id: number, values: TransactionValues): Promise<TransactionDto> {
      const current = await ownTransaction(userId, id);
      await assertAsset(values.assetId);
      const row = await db.transaction.update({ where: { id }, data: data(values) });
      await touch(current.portfolioId);
      return toTransactionDto(row);
    },

    async remove(userId: number, id: number): Promise<void> {
      const current = await ownTransaction(userId, id);
      await db.transaction.delete({ where: { id } });
      await touch(current.portfolioId);
    },

    /** CSV transaction ของพอร์ตนั้น (รวมปันผล ไม่รวมพอร์ตในถังขยะ) */
    async exportCsv(userId: number, portfolioId: number) {
      const portfolio = await findOwnPortfolio(db, userId, portfolioId);
      const rows = await db.transaction.findMany({
        where: { portfolioId },
        include: { asset: true },
        orderBy: [{ date: 'desc' }, { id: 'desc' }],
      });
      const csv = toCsv(
        ['Date', 'Type', 'Ticker', 'Asset', 'Price', 'Units', 'Fee', 'Amount', 'Note', 'Tag'],
        rows.map((row) => {
          const tx = toTransactionDto(row);
          return [tx.date, tx.type, row.asset.ticker, row.asset.name, tx.price, tx.units, tx.fee, txAmount(tx), tx.note, tx.tag];
        }),
      );
      return { csv, fileName: `${portfolio.name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'portfolio'}-transactions.csv` };
    },
  };
}

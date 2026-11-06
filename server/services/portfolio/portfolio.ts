import type { AppContext } from '../../context.js';
import type { Db } from '../../db/client.js';
import { HttpError } from '../../middleware/http-error.js';
import { fromSatang, optional, toSatang } from '../shared/money.js';
import { runRate, totalDca } from '../shared/portfolio-math.js';
import { toTransactionDto } from '../shared/transactions.js';

export const ICONS = ['leaf', 'bag', 'pot', 'anchor', 'gem', 'landmark'] as const;
export type PortfolioIcon = (typeof ICONS)[number];

/** รูปเดียวกับ Portfolio ฝั่ง frontend (ค่าสรุปคำนวณจาก transaction ทุกครั้งที่ขอ) */
export type PortfolioDto = {
  id: number;
  name: string;
  tagline: string | null;
  description: string | null;
  icon: PortfolioIcon;
  annualGoal: number | null;
  reached: number;
  totalDca: number;
  entries: number;
  updatedAt: string;
  deletedAt: string | null;
};

export type PortfolioValues = {
  name: string;
  tagline: string | null;
  description: string | null;
  icon: PortfolioIcon;
  annualGoal: number | null;
};

export const NOT_FOUND = 'This portfolio no longer exists.';

type PortfolioRow = {
  id: number;
  name: string;
  tagline: string | null;
  description: string | null;
  icon: string | null;
  annualDividendGoal: bigint | null;
  updatedAt: Date;
  deletedAt: Date | null;
};

/**
 * ต่อค่าสรุปให้พอร์ตหลายใบด้วย query เดียว (ไม่วนทีละพอร์ต) Last updated = ล่าสุดระหว่างพอร์ตเองกับ transaction
 * ตรวจผ่านรายการพอร์ตของผู้ใช้เท่านั้น (transaction ไม่มี userId ตรงๆ)
 */
export async function withSummaries(db: Db, rows: PortfolioRow[]): Promise<PortfolioDto[]> {
  const transactions = await db.transaction.findMany({ where: { portfolioId: { in: rows.map((row) => row.id) } } });
  const byPortfolio = new Map<number, ReturnType<typeof toTransactionDto>[]>();
  for (const tx of transactions) {
    const list = byPortfolio.get(tx.portfolioId) ?? [];
    list.push(toTransactionDto(tx));
    byPortfolio.set(tx.portfolioId, list);
  }
  return rows.map((row) => {
    const own = byPortfolio.get(row.id) ?? [];
    const lastChange = own.reduce((latest, tx) => (tx.updatedAt > latest ? tx.updatedAt : latest), '');
    const updatedAt = lastChange > row.updatedAt.toISOString() ? lastChange : row.updatedAt.toISOString();
    return {
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      description: row.description,
      icon: ICONS.find((icon) => icon === row.icon) ?? 'leaf',
      annualGoal: row.annualDividendGoal === null ? null : fromSatang(row.annualDividendGoal),
      reached: Math.round(runRate(own)),
      totalDca: Math.round(totalDca(own)),
      entries: own.length,
      updatedAt,
      deletedAt: row.deletedAt?.toISOString() ?? null,
    };
  });
}

/** พอร์ตของผู้ใช้ (ไม่พบหรือเป็นของคนอื่น = 404) includeTrashed = รวมที่อยู่ในถังขยะ */
export async function findOwnPortfolio(db: Db, userId: number, id: number, includeTrashed = false) {
  const portfolio = await db.portfolio.findFirst({
    where: { id, userId, ...(includeTrashed ? {} : { deletedAt: null }) },
  });
  if (!portfolio) throw new HttpError(404, NOT_FOUND);
  return portfolio;
}

export function portfolioService({ db }: AppContext) {
  const one = async (row: PortfolioRow) => (await withSummaries(db, [row]))[0];

  return {
    /** พอร์ตที่ยังไม่อยู่ในถังขยะ เรียงตาม id น้อย → มาก */
    async list(userId: number): Promise<PortfolioDto[]> {
      const rows = await db.portfolio.findMany({ where: { userId, deletedAt: null }, orderBy: { id: 'asc' } });
      return withSummaries(db, rows);
    },

    async get(userId: number, id: number): Promise<PortfolioDto> {
      return one(await findOwnPortfolio(db, userId, id));
    },

    async create(userId: number, values: PortfolioValues): Promise<PortfolioDto> {
      const row = await db.portfolio.create({
        data: {
          userId,
          name: values.name,
          tagline: values.tagline,
          description: values.description,
          icon: values.icon,
          annualDividendGoal: optional(values.annualGoal, toSatang),
        },
      });
      return one(row);
    },

    async update(userId: number, id: number, values: PortfolioValues): Promise<PortfolioDto> {
      await findOwnPortfolio(db, userId, id);
      const row = await db.portfolio.update({
        where: { id },
        data: {
          name: values.name,
          tagline: values.tagline,
          description: values.description,
          icon: values.icon,
          annualDividendGoal: optional(values.annualGoal, toSatang),
        },
      });
      return one(row);
    },

    /** ย้ายไปถังขยะ (Soft delete) transaction ไม่ถูกแตะ */
    async trash(userId: number, id: number): Promise<void> {
      await findOwnPortfolio(db, userId, id);
      await db.portfolio.update({ where: { id }, data: { deletedAt: new Date() } });
    },

    /** กู้คืนจากถังขยะ (ปุ่ม Undo และหน้า Trash) */
    async restore(userId: number, id: number): Promise<PortfolioDto> {
      await findOwnPortfolio(db, userId, id, true);
      const row = await db.portfolio.update({ where: { id }, data: { deletedAt: null } });
      return one(row);
    },
  };
}

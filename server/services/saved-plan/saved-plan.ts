import type { AppContext } from '../../context.js';
import { HttpError } from '../../middleware/http-error.js';
import { calculatePlan, type PhaseInput } from '../shared/calculate-plan.js';
import { fromSatang, toSatang } from '../shared/money.js';

/** รูปเดียวกับ CalcPlan ฝั่ง frontend */
export type PlanDto = {
  id: number;
  portfolioId: number | null;
  name: string;
  principal: number;
  resultAmount: number;
  savedAt: string;
  phases: PhaseInput[];
  assets: { assetId: number; dividendPct: number }[];
};

export type PlanValues = {
  portfolioId: number | null;
  name: string;
  principal: number;
  phases: PhaseInput[];
  assets: { assetId: number; dividendPct: number }[];
};

const NOT_FOUND = 'This plan no longer exists.';

type PlanRow = {
  id: number;
  portfolioId: number | null;
  name: string;
  principal: bigint;
  resultAmount: bigint;
  savedAt: Date;
  phases: { orderNo: number; years: number; monthlyDca: bigint }[];
  assets: { assetId: number; dividendBp: number }[];
};

const include = { phases: { orderBy: { orderNo: 'asc' as const } }, assets: { orderBy: { id: 'asc' as const } } };

const toDto = (plan: PlanRow): PlanDto => ({
  id: plan.id,
  portfolioId: plan.portfolioId,
  name: plan.name,
  principal: fromSatang(plan.principal),
  resultAmount: fromSatang(plan.resultAmount),
  savedAt: plan.savedAt.toISOString(),
  phases: plan.phases.map((phase) => ({ years: phase.years, monthlyDca: fromSatang(phase.monthlyDca) })),
  assets: plan.assets.map((asset) => ({ assetId: asset.assetId, dividendPct: asset.dividendBp / 100 })),
});

// แผนที่บันทึกไว้ (ลบจริง ไม่มีถังขยะ) ทุกคำสั่งกรองด้วย userId
export function savedPlanService({ db }: AppContext) {
  async function own(userId: number, id: number) {
    const plan = await db.calcPlan.findFirst({ where: { id, userId }, include });
    if (!plan) throw new HttpError(404, NOT_FOUND);
    return plan;
  }

  return {
    /** ใหม่ → เก่า */
    async list(userId: number): Promise<PlanDto[]> {
      const plans = await db.calcPlan.findMany({ where: { userId }, include, orderBy: [{ savedAt: 'desc' }, { id: 'desc' }] });
      return plans.map(toDto);
    },

    async get(userId: number, id: number): Promise<PlanDto> {
      return toDto(await own(userId, id));
    },

    /** ชื่อพอร์ตของแผนทั้งหมด รวมพอร์ตในถังขยะ (แผนยังอ้างอิงพอร์ตในถังขยะได้) */
    async portfolioNames(userId: number): Promise<{ id: number; name: string }[]> {
      return db.portfolio.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { id: 'asc' } });
    },

    /** บันทึกแผน: ผลลัพธ์คำนวณใหม่ที่ server ไม่เชื่อค่าที่หน้าจอส่งมา */
    async create(userId: number, values: PlanValues): Promise<PlanDto> {
      if (values.portfolioId !== null) {
        const portfolio = await db.portfolio.findFirst({ where: { id: values.portfolioId, userId, deletedAt: null }, select: { id: true } });
        if (!portfolio) throw new HttpError(400, 'This portfolio no longer exists.');
      }
      const found = await db.asset.count({ where: { id: { in: values.assets.map((asset) => asset.assetId) } } });
      if (found !== new Set(values.assets.map((asset) => asset.assetId)).size) {
        throw new HttpError(400, 'Please choose stocks or funds from the list.');
      }
      const avgYieldPct = values.assets.reduce((sum, asset) => sum + asset.dividendPct, 0) / values.assets.length;
      const { total } = calculatePlan({ principal: values.principal, phases: values.phases, avgYieldPct });

      const plan = await db.calcPlan.create({
        data: {
          userId,
          portfolioId: values.portfolioId,
          name: values.name,
          principal: toSatang(values.principal),
          resultAmount: toSatang(total),
          savedAt: new Date(),
          phases: {
            create: values.phases.map((phase, index) => ({ orderNo: index + 1, years: phase.years, monthlyDca: toSatang(phase.monthlyDca) })),
          },
          assets: { create: values.assets.map((asset) => ({ assetId: asset.assetId, dividendBp: Math.round(asset.dividendPct * 100) })) },
        },
        include,
      });
      return toDto(plan);
    },

    /** เปลี่ยนชื่อ (วันที่บันทึกไม่เปลี่ยน) */
    async rename(userId: number, id: number, name: string): Promise<PlanDto> {
      await own(userId, id);
      return toDto(await db.calcPlan.update({ where: { id }, data: { name }, include }));
    },

    async remove(userId: number, id: number): Promise<void> {
      await own(userId, id);
      await db.calcPlan.delete({ where: { id } });
    },
  };
}

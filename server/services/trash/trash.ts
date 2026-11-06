import type { AppContext } from '../../context.js';
import { HttpError } from '../../middleware/http-error.js';
import { journalingService } from '../journaling/journaling.js';
import { toNoteDto, type NoteDto } from '../shared/notes.js';
import { findOwnPortfolio, withSummaries, type PortfolioDto } from '../portfolio/portfolio.js';

export type TrashedNoteDto = NoteDto & { deletedAt: string };
export type TrashedPortfolioDto = PortfolioDto & { deletedAt: string; planCount: number };

const NOTE_GONE = 'This journal is no longer in the trash.';
const PORTFOLIO_GONE = 'This portfolio is no longer in the trash.';

// ถังขยะ: โน้ตและพอร์ตที่ผู้ใช้ลบไว้ กู้คืนหรือลบถาวร ไม่มีการลบอัตโนมัติ (ทุกคำสั่งกรองด้วย userId)
export function trashService(ctx: AppContext) {
  const { db } = ctx;
  const journaling = journalingService(ctx);

  async function trashedNote(userId: number, id: number) {
    const note = await db.note.findFirst({ where: { id, userId, deletedAt: { not: null } } });
    if (!note) throw new HttpError(404, NOTE_GONE);
    return note;
  }

  async function trashedPortfolio(userId: number, id: number) {
    const portfolio = await db.portfolio.findFirst({ where: { id, userId, deletedAt: { not: null } } });
    if (!portfolio) throw new HttpError(404, PORTFOLIO_GONE);
    return portfolio;
  }

  return {
    // ===== โน้ต =====
    /** ลบล่าสุดก่อน */
    async listNotes(userId: number): Promise<TrashedNoteDto[]> {
      const notes = await db.note.findMany({ where: { userId, deletedAt: { not: null } }, orderBy: { deletedAt: 'desc' } });
      return notes.map((note) => ({ ...toNoteDto(note), deletedAt: note.deletedAt!.toISOString() }));
    },

    /** กู้คืน: กลับไปอยู่ในไทม์ไลน์ตามวันที่เขียนเดิม */
    async restoreNote(userId: number, id: number): Promise<NoteDto> {
      await trashedNote(userId, id);
      return toNoteDto(await db.note.update({ where: { id }, data: { deletedAt: null } }));
    },

    /** ลบถาวร: ลบโน้ต ไฟล์แนบ (ทั้งแถวและไฟล์) และฉบับร่าง */
    async purgeNote(userId: number, id: number): Promise<void> {
      await trashedNote(userId, id);
      await journaling.removeAttachmentFiles([id]);
      await db.note.delete({ where: { id } });
    },

    async emptyNotes(userId: number): Promise<number> {
      const notes = await db.note.findMany({ where: { userId, deletedAt: { not: null } }, select: { id: true } });
      const ids = notes.map((note) => note.id);
      await journaling.removeAttachmentFiles(ids);
      await db.note.deleteMany({ where: { id: { in: ids } } });
      return ids.length;
    },

    // ===== พอร์ต =====
    async listPortfolios(userId: number): Promise<TrashedPortfolioDto[]> {
      const rows = await db.portfolio.findMany({ where: { userId, deletedAt: { not: null } }, orderBy: { deletedAt: 'desc' } });
      const summaries = await withSummaries(db, rows);
      const counts = await db.calcPlan.groupBy({
        by: ['portfolioId'],
        where: { userId, portfolioId: { in: rows.map((row) => row.id) } },
        _count: { _all: true },
      });
      const planCount = new Map(counts.map((row) => [row.portfolioId, row._count._all]));
      return summaries.map((portfolio) => ({
        ...portfolio,
        deletedAt: portfolio.deletedAt ?? '',
        planCount: planCount.get(portfolio.id) ?? 0,
      }));
    },

    /** ลบถาวร: ลบพอร์ตและ transaction ทั้งหมด แผนที่อ้างอิงไม่ถูกลบ แต่เปลี่ยนแหล่งที่มาเป็น "กรอกเอง" (portfolioId = null) */
    async purgePortfolio(userId: number, id: number): Promise<void> {
      await trashedPortfolio(userId, id);
      await db.$transaction([
        db.calcPlan.updateMany({ where: { userId, portfolioId: id }, data: { portfolioId: null } }),
        db.portfolio.delete({ where: { id } }),
      ]);
    },

    async emptyPortfolios(userId: number): Promise<number> {
      const rows = await db.portfolio.findMany({ where: { userId, deletedAt: { not: null } }, select: { id: true } });
      const ids = rows.map((row) => row.id);
      await db.$transaction([
        db.calcPlan.updateMany({ where: { userId, portfolioId: { in: ids } }, data: { portfolioId: null } }),
        db.portfolio.deleteMany({ where: { id: { in: ids } } }),
      ]);
      return ids.length;
    },

    /** ตรวจว่าพอร์ตอยู่ในถังขยะของผู้ใช้ (ใช้กับ route กู้คืน) */
    async restorePortfolio(userId: number, id: number) {
      await trashedPortfolio(userId, id);
      const row = await findOwnPortfolio(db, userId, id, true);
      const restored = await db.portfolio.update({ where: { id: row.id }, data: { deletedAt: null } });
      return (await withSummaries(db, [restored]))[0];
    },
  };
}

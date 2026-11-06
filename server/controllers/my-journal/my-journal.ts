import type { Request, Response } from 'express';
import type { AppContext } from '../../context.js';
import { currentUserId } from '../../middleware/auth.js';
import { myJournalService } from '../../services/my-journal/my-journal.js';

export function myJournalController(ctx: AppContext) {
  const service = myJournalService(ctx);

  return {
    async list(_req: Request, res: Response) {
      res.json(await service.list(currentUserId(res.locals)));
    },

    async exportCsv(_req: Request, res: Response) {
      const csv = await service.exportCsv(currentUserId(res.locals));
      res.type('text/csv; charset=utf-8').attachment('journals.csv').send(csv);
    },
  };
}

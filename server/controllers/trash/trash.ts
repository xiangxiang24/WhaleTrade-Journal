import type { Request, Response } from 'express';
import type { AppContext } from '../../context.js';
import { currentUserId } from '../../middleware/auth.js';
import { trashService } from '../../services/trash/trash.js';
import { idParam } from '../shared/parse.js';

export function trashController(ctx: AppContext) {
  const service = trashService(ctx);
  const user = (res: Response) => currentUserId(res.locals);

  return {
    async listNotes(_req: Request, res: Response) {
      res.json(await service.listNotes(user(res)));
    },
    async restoreNote(req: Request, res: Response) {
      res.json(await service.restoreNote(user(res), idParam(req)));
    },
    async purgeNote(req: Request, res: Response) {
      await service.purgeNote(user(res), idParam(req));
      res.status(204).end();
    },
    async emptyNotes(_req: Request, res: Response) {
      res.json({ deleted: await service.emptyNotes(user(res)) });
    },

    async listPortfolios(_req: Request, res: Response) {
      res.json(await service.listPortfolios(user(res)));
    },
    async restorePortfolio(req: Request, res: Response) {
      res.json(await service.restorePortfolio(user(res), idParam(req)));
    },
    async purgePortfolio(req: Request, res: Response) {
      await service.purgePortfolio(user(res), idParam(req));
      res.status(204).end();
    },
    async emptyPortfolios(_req: Request, res: Response) {
      res.json({ deleted: await service.emptyPortfolios(user(res)) });
    },
  };
}

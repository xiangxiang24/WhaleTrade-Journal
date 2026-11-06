import type { Request, Response } from 'express';
import type { AppContext } from '../../context.js';
import { assetsService } from '../../services/assets/assets.js';

const MAX_LIMIT = 1000;

export function assetsController(ctx: AppContext) {
  const service = assetsService(ctx);

  return {
    // GET /api/assets?q=&limit=  หรือ  ?ids=1,2,3
    async list(req: Request, res: Response) {
      if (typeof req.query.ids === 'string') {
        const ids = req.query.ids.split(',').map(Number).filter((id) => Number.isSafeInteger(id) && id > 0).slice(0, MAX_LIMIT);
        res.json(await service.byIds(ids));
        return;
      }
      const query = typeof req.query.q === 'string' ? req.query.q.slice(0, 100) : '';
      const requested = Number(req.query.limit);
      const limit = Number.isInteger(requested) && requested > 0 ? Math.min(requested, MAX_LIMIT) : MAX_LIMIT;
      res.json(await service.search(query, limit));
    },
  };
}

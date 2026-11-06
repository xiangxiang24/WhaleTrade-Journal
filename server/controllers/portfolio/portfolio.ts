import type { Request, Response } from 'express';
import type { AppContext } from '../../context.js';
import { currentUserId } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/http-error.js';
import { ICONS, portfolioService, type PortfolioValues } from '../../services/portfolio/portfolio.js';
import { bodyObject, idParam, optionalNumber, optionalText, requiredText } from '../shared/parse.js';

// ขีดจำกัดตรงกับฟอร์มฝั่ง frontend (portfolio-form-modal.tsx)
const NAME_MAX = 40;
const TAGLINE_MAX = 48;
const DESCRIPTION_MAX = 160;
const GOAL_MAX = 999_999_999_999;

function portfolioValues(req: Request): PortfolioValues {
  const body = bodyObject(req);
  const icon = ICONS.find((item) => item === body.icon);
  if (!icon) throw new HttpError(400, 'Please choose an icon.');
  const annualGoal = optionalNumber(body.annualGoal, 0, GOAL_MAX, 'Enter a goal greater than 0.');
  if (annualGoal !== null && annualGoal <= 0) throw new HttpError(400, 'Enter a goal greater than 0.');
  return {
    name: requiredText(body.name, NAME_MAX, 'Please name your portfolio.', `Keep the name within ${NAME_MAX} characters.`),
    tagline: optionalText(body.tagline, TAGLINE_MAX, `Keep the description within ${TAGLINE_MAX} characters.`),
    description: optionalText(body.description, DESCRIPTION_MAX, `Keep the story within ${DESCRIPTION_MAX} characters.`),
    icon,
    annualGoal,
  };
}

export function portfolioController(ctx: AppContext) {
  const service = portfolioService(ctx);

  return {
    async list(_req: Request, res: Response) {
      res.json(await service.list(currentUserId(res.locals)));
    },
    async get(req: Request, res: Response) {
      res.json(await service.get(currentUserId(res.locals), idParam(req)));
    },
    async create(req: Request, res: Response) {
      res.status(201).json(await service.create(currentUserId(res.locals), portfolioValues(req)));
    },
    async update(req: Request, res: Response) {
      res.json(await service.update(currentUserId(res.locals), idParam(req), portfolioValues(req)));
    },
    async trash(req: Request, res: Response) {
      await service.trash(currentUserId(res.locals), idParam(req));
      res.status(204).end();
    },
    async restore(req: Request, res: Response) {
      res.json(await service.restore(currentUserId(res.locals), idParam(req)));
    },
  };
}

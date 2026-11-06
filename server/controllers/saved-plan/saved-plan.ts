import type { Request, Response } from 'express';
import type { AppContext } from '../../context.js';
import { currentUserId } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/http-error.js';
import { savedPlanService, type PlanValues } from '../../services/saved-plan/saved-plan.js';
import { bodyObject, idParam, numberIn, requiredText } from '../shared/parse.js';
import { checkPrincipalAndPhases } from '../target-amount/target-amount.js';

const NAME_MAX = 60;
const MAX_ASSETS = 50;

const planName = (value: unknown) =>
  requiredText(value, NAME_MAX, 'Please name your plan.', `Keep the name within ${NAME_MAX} characters.`);

function planValues(req: Request): PlanValues {
  const body = bodyObject(req);
  const { principal, phases } = checkPrincipalAndPhases(body.principal, body.phases);
  if (!Array.isArray(body.assets) || body.assets.length < 1 || body.assets.length > MAX_ASSETS) {
    throw new HttpError(400, 'Please add at least one stock or fund.');
  }
  const assets = body.assets.map((item: unknown) => {
    const asset = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
    const assetId = numberIn(asset.assetId, 1, Number.MAX_SAFE_INTEGER, 'Please choose stocks or funds from the list.');
    if (!Number.isInteger(assetId)) throw new HttpError(400, 'Please choose stocks or funds from the list.');
    return { assetId, dividendPct: numberIn(asset.dividendPct, 0, 100, 'Enter a yield between 0% and 100%.') };
  });
  const portfolioId = body.portfolioId === null || body.portfolioId === undefined ? null : numberIn(body.portfolioId, 1, Number.MAX_SAFE_INTEGER, 'This portfolio no longer exists.');
  return { portfolioId, name: planName(body.name), principal, phases, assets };
}

export function savedPlanController(ctx: AppContext) {
  const service = savedPlanService(ctx);
  const user = (res: Response) => currentUserId(res.locals);

  return {
    async list(_req: Request, res: Response) {
      res.json(await service.list(user(res)));
    },
    async portfolioNames(_req: Request, res: Response) {
      res.json(await service.portfolioNames(user(res)));
    },
    async get(req: Request, res: Response) {
      res.json(await service.get(user(res), idParam(req)));
    },
    async create(req: Request, res: Response) {
      res.status(201).json(await service.create(user(res), planValues(req)));
    },
    async rename(req: Request, res: Response) {
      res.json(await service.rename(user(res), idParam(req), planName(bodyObject(req).name)));
    },
    async remove(req: Request, res: Response) {
      await service.remove(user(res), idParam(req));
      res.status(204).end();
    },
  };
}

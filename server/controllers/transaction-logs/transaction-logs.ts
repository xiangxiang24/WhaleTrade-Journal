import type { Request, Response } from 'express';
import type { AppContext } from '../../context.js';
import { currentUserId } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/http-error.js';
import { transactionLogsService, type TransactionValues } from '../../services/transaction-logs/transaction-logs.js';
import { bodyObject, idParam, numberIn, optionalNumber, optionalText } from '../shared/parse.js';

const MAX_MONEY = 999_999_999_999;
const NOTE_MAX = 200;
const TAG_MAX = 40;

/** วันที่ตามปฏิทิน YYYY-MM-DD ที่มีอยู่จริง */
function validDate(value: unknown): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00Z`);
    if (!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value) return value;
  }
  throw new HttpError(400, 'Please choose a valid date.');
}

/** ตรวจค่าจากฟอร์มเพิ่ม/แก้ transaction: ซื้อ/ขายต้องมีราคาและจำนวนหน่วย ปันผลต้องมียอด */
function transactionValues(req: Request): TransactionValues {
  const body = bodyObject(req);
  const type = body.type;
  if (type !== 'buy' && type !== 'sell' && type !== 'dividend') throw new HttpError(400, 'Please choose a transaction type.');
  const assetId = numberIn(body.assetId, 1, Number.MAX_SAFE_INTEGER, 'Please choose a stock or fund from the list.');
  if (!Number.isInteger(assetId)) throw new HttpError(400, 'Please choose a stock or fund from the list.');
  const dividend = type === 'dividend';

  return {
    type,
    date: validDate(body.date),
    assetId,
    price: dividend ? null : numberIn(body.price, 0.0001, MAX_MONEY, 'Enter a price greater than 0.'),
    units: dividend
      ? optionalNumber(body.units, 0, MAX_MONEY, 'Enter a valid number of units.')
      : numberIn(body.units, 0.000001, MAX_MONEY, 'Enter units greater than 0.'),
    fee: dividend ? null : optionalNumber(body.fee, 0, MAX_MONEY, 'Enter a valid fee.'),
    amount: dividend ? numberIn(body.amount, 0.01, MAX_MONEY, 'Enter an amount greater than 0.') : null,
    note: optionalText(body.note, NOTE_MAX, `Keep the note within ${NOTE_MAX} characters.`),
    tag: optionalText(body.tag, TAG_MAX, `Keep the tag within ${TAG_MAX} characters.`),
  };
}

export function transactionLogsController(ctx: AppContext) {
  const service = transactionLogsService(ctx);

  return {
    async list(req: Request, res: Response) {
      res.json(await service.list(currentUserId(res.locals), idParam(req)));
    },
    async create(req: Request, res: Response) {
      res.status(201).json(await service.create(currentUserId(res.locals), idParam(req), transactionValues(req)));
    },
    async update(req: Request, res: Response) {
      res.json(await service.update(currentUserId(res.locals), idParam(req), transactionValues(req)));
    },
    async remove(req: Request, res: Response) {
      await service.remove(currentUserId(res.locals), idParam(req));
      res.status(204).end();
    },
    async exportCsv(req: Request, res: Response) {
      const { csv, fileName } = await service.exportCsv(currentUserId(res.locals), idParam(req));
      res.type('text/csv; charset=utf-8').attachment(fileName).send(csv);
    },
  };
}

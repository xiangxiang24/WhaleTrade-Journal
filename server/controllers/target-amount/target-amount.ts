import type { Request, Response } from 'express';
import type { AppContext } from '../../context.js';
import { HttpError } from '../../middleware/http-error.js';
import type { PhaseInput } from '../../services/shared/calculate-plan.js';
import { targetAmountService } from '../../services/target-amount/target-amount.js';
import { bodyObject, numberIn } from '../shared/parse.js';

// ขีดจำกัดตรงกับฟอร์มฝั่ง frontend (target-amount/types/target-amount.ts)
export const MAX_PHASES = 8;
export const MAX_YEARS = 60;
export const MAX_MONEY = 999_999_999_999;

/** ตรวจเงินต้น + เฟส (ปี 1..60 จำนวนเต็ม รวมไม่เกิน 60, DCA ≥ 0) ใช้ร่วมกับการบันทึกแผน */
export function checkPrincipalAndPhases(principalInput: unknown, phasesInput: unknown) {
  const principal = numberIn(principalInput, 0, MAX_MONEY, 'Enter a valid starting amount.');
  if (!Array.isArray(phasesInput) || phasesInput.length < 1 || phasesInput.length > MAX_PHASES) {
    throw new HttpError(400, `Add between 1 and ${MAX_PHASES} phases.`);
  }
  const phases: PhaseInput[] = phasesInput.map((item: unknown) => {
    const phase = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
    const years = numberIn(phase.years, 1, MAX_YEARS, `Enter a duration from 1 to ${MAX_YEARS} years.`);
    if (!Number.isInteger(years)) throw new HttpError(400, `Enter a duration from 1 to ${MAX_YEARS} years.`);
    return { years, monthlyDca: numberIn(phase.monthlyDca, 0, MAX_MONEY, 'Enter a valid monthly amount.') };
  });
  if (phases.reduce((sum, phase) => sum + phase.years, 0) > MAX_YEARS) {
    throw new HttpError(400, `Total duration can be at most ${MAX_YEARS} years.`);
  }
  return { principal, phases };
}

export function targetAmountController(ctx: AppContext) {
  const service = targetAmountService(ctx);

  return {
    // POST /api/calculator/calculate
    calculate(req: Request, res: Response) {
      const body = bodyObject(req);
      const { principal, phases } = checkPrincipalAndPhases(body.principal, body.phases);
      const avgYieldPct = numberIn(body.avgYieldPct, 0, 100, 'Enter a yield between 0% and 100%.');
      res.json(service.calculate({ principal, phases, avgYieldPct }));
    },
  };
}

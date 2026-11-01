import { Router } from 'express';
import type { createDb } from '../db/client.js';

type Db = ReturnType<typeof createDb>;

export function savedPlanRoutes(db: Db) {
  const router = Router();

  // endpoints ของหน้า saved-plan เพิ่มที่นี่

  return router;
}

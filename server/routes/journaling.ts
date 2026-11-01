import { Router } from 'express';
import type { createDb } from '../db/client.js';

type Db = ReturnType<typeof createDb>;

export function journalingRoutes(db: Db) {
  const router = Router();

  // endpoints ของหน้า journaling เพิ่มที่นี่

  return router;
}

import { Router } from 'express';
import type { createDb } from '../db/client.js';

type Db = ReturnType<typeof createDb>;

export function reminderRoutes(db: Db) {
  const router = Router();

  // endpoints ของหน้า reminder เพิ่มที่นี่

  return router;
}

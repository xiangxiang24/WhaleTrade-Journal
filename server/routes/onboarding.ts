import { Router } from 'express';
import type { createDb } from '../db/client.js';

type Db = ReturnType<typeof createDb>;

export function onboardingRoutes(db: Db) {
  const router = Router();

  // endpoints ของหน้า onboarding เพิ่มที่นี่

  return router;
}

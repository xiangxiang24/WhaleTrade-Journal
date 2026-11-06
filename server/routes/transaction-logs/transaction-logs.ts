import { Router } from 'express';
import type { AppContext } from '../../context.js';
import { transactionLogsController } from '../../controllers/transaction-logs/transaction-logs.js';
import { requireAuth } from '../../middleware/auth.js';

// endpoints ของฟีเจอร์: หน้าพอร์ตเดียว — transaction ของพอร์ต และ Export CSV
export function transactionLogsRoutes(ctx: AppContext) {
  const router = Router();
  const controller = transactionLogsController(ctx);
  const auth = requireAuth(ctx);

  router.get('/api/portfolios/:id/transactions', auth, controller.list);
  router.post('/api/portfolios/:id/transactions', auth, controller.create);
  router.get('/api/portfolios/:id/transactions/export.csv', auth, controller.exportCsv);
  router.put('/api/transactions/:id', auth, controller.update);
  router.delete('/api/transactions/:id', auth, controller.remove);

  return router;
}

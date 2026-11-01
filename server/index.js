import { PrismaClient } from '@prisma/client/extension';
import express from 'express';

export function startServer(db, port = 3001) {
  const app = express();
  app.use(express.json());
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  // routes อื่นเพิ่มภายหลัง
  return app.listen(port, '127.0.0.1');   // ← สำคัญ
}
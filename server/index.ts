import express from 'express';
import type { Db } from './db/client.js';
import { registerRoutes } from './routes/index.js';

export function startServer(db: Db, port = 3001) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  registerRoutes(app, db);
  return app.listen(port, '127.0.0.1'); // ฟังเฉพาะเครื่องตัวเองเท่านั้น
}

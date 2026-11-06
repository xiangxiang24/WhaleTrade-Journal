import express from 'express';
import type { AppContext } from './context.js';
import { errorHandler } from './middleware/http-error.js';
import { registerRoutes } from './routes/index.js';

/** สร้างแอป Express (แยกจากการ listen เพื่อให้ทดสอบได้) */
export function createApp(ctx: AppContext) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  registerRoutes(app, ctx);
  app.use(errorHandler);
  return app;
}

export function startServer(ctx: AppContext, port = 3001) {
  return createApp(ctx).listen(port, '127.0.0.1'); // ฟังเฉพาะเครื่องตัวเองเท่านั้น
}

import express from 'express';
import path from 'node:path';
import type { AppContext } from './context.js';
import { errorHandler } from './middleware/http-error.js';
import { registerRoutes } from './routes/index.js';

/** สร้างแอป Express (แยกจากการ listen เพื่อให้ทดสอบได้)
 * webDir: โฟลเดอร์หน้าเว็บที่ build แล้ว (frontend/dist) แอปจริงให้ server ส่งหน้าเว็บเองเพื่อให้หน้ากับ API อยู่ origin เดียวกัน */
export function createApp(ctx: AppContext, webDir?: string) {
  const app = express();
  app.disable('x-powered-by');
  // เนื้อไฟล์แนบเป็นไบต์ดิบ จึงข้ามตัวอ่าน JSON (route นั้นมีตัวอ่านของตัวเอง)
  const json = express.json({ limit: '2mb' });
  app.use((req, res, next) => (req.path.endsWith('/attachments') ? next() : json(req, res, next)));
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  registerRoutes(app, ctx);
  if (webDir) {
    app.use(express.static(webDir));
    app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(webDir, 'index.html')));
  }
  app.use(errorHandler);
  return app;
}

export function startServer(ctx: AppContext, port = 3001, webDir?: string) {
  return createApp(ctx, webDir).listen(port, '127.0.0.1'); // ฟังเฉพาะเครื่องตัวเองเท่านั้น
}

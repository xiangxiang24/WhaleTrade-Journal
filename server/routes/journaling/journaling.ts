import express, { Router } from 'express';
import type { AppContext } from '../../context.js';
import { journalingController } from '../../controllers/journaling/journaling.js';
import { requireAuth } from '../../middleware/auth.js';

// endpoints ของฟีเจอร์: เขียน / ดู / แก้โน้ต, ฉบับร่าง, ไฟล์แนบ
export function journalingRoutes(ctx: AppContext) {
  const router = Router();
  const controller = journalingController(ctx);
  const auth = requireAuth(ctx);

  router.post('/api/notes', auth, controller.create);
  router.get('/api/notes/:id', auth, controller.get);
  router.put('/api/notes/:id', auth, controller.update);
  router.delete('/api/notes/:id', auth, controller.remove);

  router.get('/api/notes/:id/draft', auth, controller.getDraft);
  router.put('/api/notes/:id/draft', auth, controller.saveDraft);
  router.delete('/api/notes/:id/draft', auth, controller.deleteDraft);

  // ไฟล์แนบส่งเป็นไบต์ดิบ (ไม่ใช่ JSON) ตัวอ่าน body จึงผูกกับ route นี้ และ server/index.ts ข้ามตัวอ่าน JSON ให้
  router.post('/api/notes/:id/attachments', auth, express.raw({ type: () => true, limit: '26mb' }), controller.addAttachment);
  router.get('/api/attachments/:id/file', controller.readAttachment);

  return router;
}

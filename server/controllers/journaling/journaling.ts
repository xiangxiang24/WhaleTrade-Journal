import type { Request, Response } from 'express';
import type { AppContext } from '../../context.js';
import { currentUserId } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/http-error.js';
import { journalingService, type NoteValues } from '../../services/journaling/journaling.js';
import { isContentEmpty } from '../../services/shared/note-content.js';
import { EMOTIONS } from '../../services/shared/notes.js';
import { verifySignature } from '../../services/shared/signed-url.js';
import { bodyObject, idParam, optionalText } from '../shared/parse.js';

const TITLE_MAX = 200;
const CONTENT_MAX = 1_000_000;

/** ตรวจค่าจากฟอร์มโน้ต (ตรงกับ NoteFormValues: title, content, emotion) */
function noteValues(req: Request): NoteValues {
  const body = bodyObject(req);
  const title = optionalText(body.title, TITLE_MAX, `Keep the title within ${TITLE_MAX} characters.`);
  const content = typeof body.content === 'string' ? body.content : '';
  if (isContentEmpty(content)) throw new HttpError(400, 'Please write something before saving.');
  if (content.length > CONTENT_MAX) throw new HttpError(413, 'This journal is too long.');
  const emotion = body.emotion ?? null;
  if (emotion !== null && !EMOTIONS.some((item) => item === emotion)) throw new HttpError(400, 'Please choose a valid mood.');
  return { title, content, emotion: emotion as NoteValues['emotion'] };
}

export function journalingController(ctx: AppContext) {
  const service = journalingService(ctx);

  return {
    async get(req: Request, res: Response) {
      res.json(await service.get(currentUserId(res.locals), idParam(req)));
    },
    async create(req: Request, res: Response) {
      res.status(201).json(await service.create(currentUserId(res.locals), noteValues(req)));
    },
    async update(req: Request, res: Response) {
      res.json(await service.update(currentUserId(res.locals), idParam(req), noteValues(req)));
    },
    async remove(req: Request, res: Response) {
      await service.remove(currentUserId(res.locals), idParam(req));
      res.status(204).end();
    },

    async getDraft(req: Request, res: Response) {
      res.json(await service.getDraft(currentUserId(res.locals), idParam(req)));
    },
    async saveDraft(req: Request, res: Response) {
      // ฉบับร่างบันทึกได้แม้เนื้อหายังว่าง (ยังพิมพ์ไม่เสร็จ)
      const body = bodyObject(req);
      const content = typeof body.content === 'string' ? body.content : '';
      if (content.length > CONTENT_MAX) throw new HttpError(413, 'This journal is too long.');
      const emotion = body.emotion ?? null;
      const values: NoteValues = {
        title: optionalText(body.title, TITLE_MAX, `Keep the title within ${TITLE_MAX} characters.`),
        content,
        emotion: EMOTIONS.find((item) => item === emotion) ?? null,
      };
      res.json({ savedAt: await service.saveDraft(currentUserId(res.locals), idParam(req), values) });
    },
    async deleteDraft(req: Request, res: Response) {
      await service.deleteDraft(currentUserId(res.locals), idParam(req));
      res.status(204).end();
    },

    // POST /api/notes/:id/attachments?kind=image|file&name=<ชื่อไฟล์ที่ encodeURIComponent>  เนื้อ = ไบต์ของไฟล์
    async addAttachment(req: Request, res: Response) {
      const kind = req.query.kind === 'image' ? 'image' : 'file';
      const name = (typeof req.query.name === 'string' ? req.query.name : '').trim().slice(0, 200) || 'file';
      const data: unknown = req.body;
      if (!Buffer.isBuffer(data)) throw new HttpError(400, 'Please choose a file.');
      const mime = (req.headers['content-type'] ?? 'application/octet-stream').split(';')[0].trim().toLowerCase();
      res.status(201).json(await service.addAttachment(currentUserId(res.locals), idParam(req), { kind, name, mime, data }));
    },

    // GET /api/attachments/:id/file?sig=...  (เปิดจาก <img> / ลิงก์ได้ ตรวจด้วยลายเซ็นแทน token)
    async readAttachment(req: Request, res: Response) {
      const id = idParam(req);
      if (!verifySignature(ctx.secrets, `attachment:${id}`, req.query.sig)) throw new HttpError(404, 'This file no longer exists.');
      const file = await service.readAttachment(id);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      res.type(file.mime);
      res.setHeader('Content-Disposition', `${file.inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(file.name)}`);
      res.sendFile(file.absolutePath);
    },
  };
}

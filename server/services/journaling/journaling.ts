import type { AppContext } from '../../context.js';
import { HttpError } from '../../middleware/http-error.js';
import { contentToPlainText } from '../shared/note-content.js';
import { findActiveNote, toNoteDto, type Emotion, type NoteDto } from '../shared/notes.js';
import { fileExists, filePath, removeFile, saveFile } from '../shared/storage.js';
import { signedPath } from '../shared/signed-url.js';

export type NoteValues = { title: string | null; content: string; emotion: Emotion | null };

export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const FILE_MAX_BYTES = 25 * 1024 * 1024;
// ชนิดภาพที่แสดงในหน้าได้ (ไม่รวม SVG ที่รันสคริปต์ได้) ที่เหลือบังคับดาวน์โหลด
const INLINE_IMAGE = /^image\/(png|jpe?g|gif|webp|avif)$/;

export type UploadedAttachmentDto = { url: string; name: string; size: number; mime: string };

export function journalingService({ db, secrets, dataDir }: AppContext) {
  const attachmentUrl = (id: number) => signedPath(secrets, `/api/attachments/${id}/file`, `attachment:${id}`);

  return {
    async get(userId: number, id: number): Promise<NoteDto> {
      return toNoteDto(await findActiveNote(db, userId, id));
    },

    async create(userId: number, values: NoteValues): Promise<NoteDto> {
      const note = await db.note.create({
        data: {
          userId,
          title: values.title,
          content: values.content,
          contentText: contentToPlainText(values.content),
          emotion: values.emotion,
          emotionChangedAt: values.emotion ? new Date() : null,
        },
      });
      return toNoteDto(note);
    },

    async update(userId: number, id: number, values: NoteValues): Promise<NoteDto> {
      const current = await findActiveNote(db, userId, id);
      const note = await db.note.update({
        where: { id },
        data: {
          title: values.title,
          content: values.content,
          contentText: contentToPlainText(values.content),
          emotion: values.emotion,
          // เก็บเวลาที่เปลี่ยนอารมณ์ล่าสุด (เลือก/เปลี่ยน/ยกเลิก) ไว้เบื้องหลัง
          ...(current.emotion !== values.emotion ? { emotionChangedAt: new Date() } : {}),
        },
      });
      return toNoteDto(note);
    },

    /** ลบโน้ต = ย้ายไปถังขยะ และลบฉบับร่างของโน้ตนั้นทิ้ง */
    async remove(userId: number, id: number): Promise<void> {
      await findActiveNote(db, userId, id);
      await db.$transaction([
        db.note.update({ where: { id }, data: { deletedAt: new Date() } }),
        db.noteDraft.deleteMany({ where: { userId, noteId: id } }),
      ]);
    },

    // ===== ฉบับร่างที่บันทึกอัตโนมัติ (1 ฉบับต่อโน้ต) =====
    async getDraft(userId: number, noteId: number) {
      await findActiveNote(db, userId, noteId);
      const draft = await db.noteDraft.findUnique({ where: { userId_noteId: { userId, noteId } } });
      if (!draft) return null;
      return { values: JSON.parse(draft.data) as NoteValues, savedAt: draft.savedAt.getTime() };
    },

    async saveDraft(userId: number, noteId: number, values: NoteValues): Promise<number> {
      await findActiveNote(db, userId, noteId);
      const savedAt = new Date();
      await db.noteDraft.upsert({
        where: { userId_noteId: { userId, noteId } },
        update: { data: JSON.stringify(values), savedAt },
        create: { userId, noteId, data: JSON.stringify(values), savedAt },
      });
      return savedAt.getTime();
    },

    async deleteDraft(userId: number, noteId: number): Promise<void> {
      await db.noteDraft.deleteMany({ where: { userId, noteId } });
    },

    // ===== ไฟล์แนบ =====
    async addAttachment(
      userId: number,
      noteId: number,
      input: { kind: 'image' | 'file'; name: string; mime: string; data: Buffer },
    ): Promise<UploadedAttachmentDto> {
      await findActiveNote(db, userId, noteId);
      const limit = input.kind === 'image' ? IMAGE_MAX_BYTES : FILE_MAX_BYTES;
      if (input.data.length === 0) throw new HttpError(400, 'Please choose a file.');
      if (input.data.length > limit) {
        throw new HttpError(413, `This ${input.kind} is too large. The limit is ${Math.round(limit / 1024 / 1024)} MB.`);
      }
      if (input.kind === 'image' && !input.mime.startsWith('image/')) {
        throw new HttpError(400, 'Please choose an image file.');
      }
      const relative = saveFile(dataDir, `attachments/${userId}`, input.name, input.data);
      const row = await db.noteAttachment.create({
        data: { noteId, kind: input.kind, path: relative, name: input.name, mime: input.mime, size: input.data.length },
      });
      return { url: attachmentUrl(row.id), name: row.name, size: row.size, mime: row.mime };
    },

    /** ข้อมูลไฟล์สำหรับส่งกลับ (เรียกหลังตรวจลายเซ็นของ URL แล้ว) */
    async readAttachment(id: number) {
      const row = await db.noteAttachment.findUnique({ where: { id }, include: { note: { select: { deletedAt: true } } } });
      if (!row || row.note.deletedAt || !fileExists(dataDir, row.path)) throw new HttpError(404, 'This file no longer exists.');
      return {
        absolutePath: filePath(dataDir, row.path),
        name: row.name,
        mime: INLINE_IMAGE.test(row.mime) ? row.mime : 'application/octet-stream',
        inline: row.kind === 'image' && INLINE_IMAGE.test(row.mime),
      };
    },

    /** ลบไฟล์แนบของโน้ตออกจากดิสก์ (ตอนลบโน้ตถาวร) */
    async removeAttachmentFiles(noteIds: number[]) {
      const rows = await db.noteAttachment.findMany({ where: { noteId: { in: noteIds } }, select: { path: true } });
      for (const row of rows) removeFile(dataDir, row.path);
    },
  };
}

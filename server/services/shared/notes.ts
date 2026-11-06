import type { Db } from '../../db/client.js';
import { HttpError } from '../../middleware/http-error.js';

export const EMOTIONS = ['overjoyed', 'happy', 'neutral', 'worried', 'sad'] as const;
export type Emotion = (typeof EMOTIONS)[number];

/** รูปเดียวกับ JournalNote ฝั่ง frontend */
export type NoteDto = {
  id: number;
  title: string | null;
  content: string;
  emotion: Emotion | null;
  createdAt: string;
};

type NoteRow = { id: number; title: string | null; content: string; emotion: string | null; createdAt: Date };

export const toNoteDto = (note: NoteRow): NoteDto => ({
  id: note.id,
  title: note.title,
  content: note.content,
  emotion: EMOTIONS.find((emotion) => emotion === note.emotion) ?? null,
  createdAt: note.createdAt.toISOString(),
});

export const NOT_FOUND = 'This journal no longer exists.';

/** โน้ตของผู้ใช้ที่ยังไม่อยู่ในถังขยะ (ไม่พบหรือเป็นของคนอื่น = 404) */
export async function findActiveNote(db: Db, userId: number, id: number) {
  const note = await db.note.findFirst({ where: { id, userId, deletedAt: null } });
  if (!note) throw new HttpError(404, NOT_FOUND);
  return note;
}

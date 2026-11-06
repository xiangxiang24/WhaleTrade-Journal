import type { AppContext } from '../../context.js';
import { contentToPlainText } from '../shared/note-content.js';
import { toCsv } from '../shared/csv.js';
import { toNoteDto, type NoteDto } from '../shared/notes.js';

// หน้ารวมบันทึก: ไทม์ไลน์ (เฉพาะโน้ตที่ไม่อยู่ในถังขยะ) และ Export CSV
export function myJournalService({ db }: AppContext) {
  return {
    /** โน้ตทั้งหมดของผู้ใช้ ใหม่ → เก่า (การค้นหา/กรองอารมณ์ทำฝั่งหน้าจอ) */
    async list(userId: number): Promise<NoteDto[]> {
      const notes = await db.note.findMany({
        where: { userId, deletedAt: null },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
      return notes.map(toNoteDto);
    },

    /** CSV ของโน้ตทั้งหมด (ไม่รวมถังขยะ ใช้ข้อความล้วน ไม่รวมภาพ/ไฟล์แนบ) */
    async exportCsv(userId: number): Promise<string> {
      const notes = await db.note.findMany({
        where: { userId, deletedAt: null },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      });
      return toCsv(
        ['Created at (UTC)', 'Title', 'Emotion', 'Content'],
        notes.map((note) => [
          note.createdAt.toISOString(),
          note.title,
          note.emotion,
          note.contentText || contentToPlainText(note.content),
        ]),
      );
    },
  };
}

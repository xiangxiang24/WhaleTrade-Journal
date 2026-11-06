import type { AppContext } from '../../context.js';
import { HttpError } from '../../middleware/http-error.js';

/** รูปเดียวกับ Reminder ฝั่ง frontend (เวลาเก็บและส่งเป็น UTC แปลงตามเขตเวลาผู้ใช้ตอนแสดง) */
export type ReminderDto = {
  id: number;
  title: string;
  description: string | null;
  remindAt: string;
  done: boolean;
  doneAt: string | null;
};

/** รูปเดียวกับ Task ฝั่ง frontend */
export type TaskDto = { id: number; text: string; done: boolean; createdAt: string };

export type ReminderValues = { title: string; description: string | null; remindAt: Date };

type ReminderRow = { id: number; title: string; description: string | null; remindAt: Date; done: boolean; doneAt: Date | null };
type TaskRow = { id: number; text: string; done: boolean; createdAt: Date };

const toReminder = (row: ReminderRow): ReminderDto => ({
  id: row.id,
  title: row.title,
  description: row.description,
  remindAt: row.remindAt.toISOString(),
  done: row.done,
  doneAt: row.doneAt?.toISOString() ?? null,
});

const toTask = (row: TaskRow): TaskDto => ({ id: row.id, text: row.text, done: row.done, createdAt: row.createdAt.toISOString() });

const REMINDER_GONE = 'This reminder no longer exists.';
const TASK_GONE = 'This task no longer exists.';

// การเตือนและ task ของผู้ใช้ (ทุกคำสั่งกรองด้วย userId)
export function reminderService({ db }: AppContext) {
  async function ownReminder(userId: number, id: number) {
    const row = await db.reminder.findFirst({ where: { id, userId } });
    if (!row) throw new HttpError(404, REMINDER_GONE);
    return row;
  }

  async function ownTask(userId: number, id: number) {
    const row = await db.task.findFirst({ where: { id, userId } });
    if (!row) throw new HttpError(404, TASK_GONE);
    return row;
  }

  return {
    async listReminders(userId: number): Promise<ReminderDto[]> {
      const rows = await db.reminder.findMany({ where: { userId }, orderBy: [{ remindAt: 'asc' }, { id: 'asc' }] });
      return rows.map(toReminder);
    },

    /** badge ที่เมนู Reminder = จำนวนที่ยังไม่เสร็จและถึงเวลาแล้ว */
    countDue(userId: number): Promise<number> {
      return db.reminder.count({ where: { userId, done: false, remindAt: { lte: new Date() } } });
    },

    async createReminder(userId: number, values: ReminderValues): Promise<ReminderDto> {
      return toReminder(await db.reminder.create({ data: { userId, ...values } }));
    },

    /** แก้ข้อความ/เวลา: ถ้าเปลี่ยนเวลาถือเป็นการเตือนใหม่ (ยังไม่เสร็จ และยังไม่เคยแจ้ง) */
    async updateReminder(userId: number, id: number, values: ReminderValues): Promise<ReminderDto> {
      const current = await ownReminder(userId, id);
      const timeChanged = current.remindAt.getTime() !== values.remindAt.getTime();
      const row = await db.reminder.update({
        where: { id },
        data: { ...values, ...(timeChanged ? { done: false, doneAt: null, notifiedAt: null } : {}) },
      });
      return toReminder(row);
    },

    async setReminderDone(userId: number, id: number, done: boolean): Promise<ReminderDto> {
      await ownReminder(userId, id);
      return toReminder(await db.reminder.update({ where: { id }, data: { done, doneAt: done ? new Date() : null } }));
    },

    async deleteReminder(userId: number, id: number): Promise<void> {
      await ownReminder(userId, id);
      await db.reminder.delete({ where: { id } });
    },

    // ===== task checkbox =====
    async listTasks(userId: number): Promise<TaskDto[]> {
      const rows = await db.task.findMany({ where: { userId }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
      return rows.map(toTask);
    },

    async createTask(userId: number, text: string): Promise<TaskDto> {
      return toTask(await db.task.create({ data: { userId, text } }));
    },

    async updateTask(userId: number, id: number, data: { text?: string; done?: boolean }): Promise<TaskDto> {
      await ownTask(userId, id);
      return toTask(await db.task.update({ where: { id }, data }));
    },

    async deleteTask(userId: number, id: number): Promise<void> {
      await ownTask(userId, id);
      await db.task.delete({ where: { id } });
    },
  };
}

import type { Db } from '../../db/client.js';

export type DueNotice = { title: string; body: string };

/** ถ้าถึงเวลาพร้อมกันเกินจำนวนนี้ รวมเป็นแจ้งเตือนเดียว (เช่นเปิดแอปหลังปิดไปหลายวัน) */
const MAX_SEPARATE = 3;

const summary = (language: string, count: number): DueNotice =>
  language === 'en'
    ? { title: 'Whale Trade Journal', body: `You have ${count} reminders due.` }
    : { title: 'Whale Trade Journal', body: `คุณมี ${count} การเตือนที่ถึงเวลาแล้ว` };

/**
 * หาการเตือนที่ถึงเวลาแล้วและยังไม่เคยแจ้ง → ทำเครื่องหมาย notifiedAt → ส่งให้ notify (เช่น macOS notification)
 * ทำเครื่องหมายก่อนส่งและจองทีละแถวด้วย updateMany เพื่อไม่ให้แจ้งซ้ำแม้ถูกเรียกซ้อนกัน คืนจำนวนที่แจ้ง
 */
export async function notifyDueReminders(db: Db, notify: (notice: DueNotice) => void, now = new Date()): Promise<number> {
  const due = await db.reminder.findMany({
    where: { done: false, notifiedAt: null, remindAt: { lte: now } },
    include: { user: { select: { language: true } } },
    orderBy: { remindAt: 'asc' },
  });
  const claimed: typeof due = [];
  for (const reminder of due) {
    const { count } = await db.reminder.updateMany({ where: { id: reminder.id, notifiedAt: null }, data: { notifiedAt: now } });
    if (count === 1) claimed.push(reminder);
  }

  const perUser = new Map<number, typeof claimed>();
  for (const reminder of claimed) perUser.set(reminder.userId, [...(perUser.get(reminder.userId) ?? []), reminder]);
  for (const list of perUser.values()) {
    if (list.length > MAX_SEPARATE) notify(summary(list[0].user.language, list.length));
    else for (const reminder of list) notify({ title: reminder.title, body: reminder.description ?? '' });
  }
  return claimed.length;
}

/** ตรวจทันทีหนึ่งครั้งแล้วทุก intervalMs คืนฟังก์ชันหยุด */
export function startReminderNotifier(db: Db, notify: (notice: DueNotice) => void, intervalMs = 30_000) {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      await notifyDueReminders(db, notify);
    } catch (error) {
      console.error('Reminder check failed:', error);
    } finally {
      running = false;
    }
  };
  void tick();
  const timer = setInterval(tick, intervalMs);
  return () => clearInterval(timer);
}

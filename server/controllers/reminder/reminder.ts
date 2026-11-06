import type { Request, Response } from 'express';
import type { AppContext } from '../../context.js';
import { currentUserId } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/http-error.js';
import { reminderService, type ReminderValues } from '../../services/reminder/reminder.js';
import { bodyObject, idParam, optionalText, requiredText } from '../shared/parse.js';

// ขีดจำกัดตรงกับฟอร์มฝั่ง frontend (reminder-form-modal.tsx / todo-card.tsx)
const TITLE_MAX = 80;
const DESCRIPTION_MAX = 200;
const TASK_MAX = 200;

function reminderValues(req: Request): ReminderValues {
  const body = bodyObject(req);
  const remindAt = typeof body.remindAt === 'string' ? new Date(body.remindAt) : new Date(Number.NaN);
  if (Number.isNaN(remindAt.getTime())) throw new HttpError(400, 'Please choose a valid date and time.');
  return {
    title: requiredText(body.title, TITLE_MAX, 'Please enter a title.', `Keep the title within ${TITLE_MAX} characters.`),
    description: optionalText(body.description, DESCRIPTION_MAX, `Keep the note within ${DESCRIPTION_MAX} characters.`),
    remindAt,
  };
}

const taskText = (value: unknown) =>
  requiredText(value, TASK_MAX, 'Please enter a task.', `Keep the task within ${TASK_MAX} characters.`);

export function reminderController(ctx: AppContext) {
  const service = reminderService(ctx);
  const user = (res: Response) => currentUserId(res.locals);

  return {
    async listReminders(_req: Request, res: Response) {
      res.json(await service.listReminders(user(res)));
    },
    async countDue(_req: Request, res: Response) {
      res.json({ count: await service.countDue(user(res)) });
    },
    async createReminder(req: Request, res: Response) {
      res.status(201).json(await service.createReminder(user(res), reminderValues(req)));
    },
    async updateReminder(req: Request, res: Response) {
      res.json(await service.updateReminder(user(res), idParam(req), reminderValues(req)));
    },
    async setReminderDone(req: Request, res: Response) {
      const done = bodyObject(req).done;
      if (typeof done !== 'boolean') throw new HttpError(400, 'The request could not be read.');
      res.json(await service.setReminderDone(user(res), idParam(req), done));
    },
    async deleteReminder(req: Request, res: Response) {
      await service.deleteReminder(user(res), idParam(req));
      res.status(204).end();
    },

    async listTasks(_req: Request, res: Response) {
      res.json(await service.listTasks(user(res)));
    },
    async createTask(req: Request, res: Response) {
      res.status(201).json(await service.createTask(user(res), taskText(bodyObject(req).text)));
    },
    // PATCH /api/tasks/:id  { text } และ/หรือ { done }
    async updateTask(req: Request, res: Response) {
      const body = bodyObject(req);
      const data: { text?: string; done?: boolean } = {};
      if (body.text !== undefined) data.text = taskText(body.text);
      if (body.done !== undefined) {
        if (typeof body.done !== 'boolean') throw new HttpError(400, 'The request could not be read.');
        data.done = body.done;
      }
      if (Object.keys(data).length === 0) throw new HttpError(400, 'The request could not be read.');
      res.json(await service.updateTask(user(res), idParam(req), data));
    },
    async deleteTask(req: Request, res: Response) {
      await service.deleteTask(user(res), idParam(req));
      res.status(204).end();
    },
  };
}

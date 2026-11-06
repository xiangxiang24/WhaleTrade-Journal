import { Router } from 'express';
import type { AppContext } from '../../context.js';
import { reminderController } from '../../controllers/reminder/reminder.js';
import { requireAuth } from '../../middleware/auth.js';

// endpoints ของฟีเจอร์: การเตือน ปฏิทิน และ task
export function reminderRoutes(ctx: AppContext) {
  const router = Router();
  const controller = reminderController(ctx);
  const auth = requireAuth(ctx);

  router.get('/api/reminders', auth, controller.listReminders);
  router.post('/api/reminders', auth, controller.createReminder);
  router.get('/api/reminders/due-count', auth, controller.countDue);
  router.put('/api/reminders/:id', auth, controller.updateReminder);
  router.patch('/api/reminders/:id/done', auth, controller.setReminderDone);
  router.delete('/api/reminders/:id', auth, controller.deleteReminder);

  router.get('/api/tasks', auth, controller.listTasks);
  router.post('/api/tasks', auth, controller.createTask);
  router.patch('/api/tasks/:id', auth, controller.updateTask);
  router.delete('/api/tasks/:id', auth, controller.deleteTask);

  return router;
}

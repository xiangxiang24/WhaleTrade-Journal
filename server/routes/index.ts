import type { Express } from 'express';
import type { Db } from '../db/client.js';
import { onboardingRoutes } from './onboarding.js';
import { myJournalRoutes } from './my-journal.js';
import { journalingRoutes } from './journaling.js';
import { portfolioRoutes } from './portfolio.js';
import { transactionLogsRoutes } from './transaction-logs.js';
import { reminderRoutes } from './reminder.js';
import { targetAmountRoutes } from './target-amount.js';
import { savedPlanRoutes } from './saved-plan.js';
import { settingPageRoutes } from './setting-page.js';
import { trashRoutes } from './trash.js';
import { assetsRoutes } from './assets.js';

// รวม router ของทุกฟีเจอร์เข้ากับแอป (แต่ละ router ประกาศ path เต็มขึ้นต้นด้วย /api เอง)
export function registerRoutes(app: Express, db: Db) {
  app.use(onboardingRoutes(db));
  app.use(myJournalRoutes(db));
  app.use(journalingRoutes(db));
  app.use(portfolioRoutes(db));
  app.use(transactionLogsRoutes(db));
  app.use(reminderRoutes(db));
  app.use(targetAmountRoutes(db));
  app.use(savedPlanRoutes(db));
  app.use(settingPageRoutes(db));
  app.use(trashRoutes(db));
  app.use(assetsRoutes(db));
}

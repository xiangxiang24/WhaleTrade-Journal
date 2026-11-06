import type { Express } from 'express';
import type { AppContext } from '../context.js';
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
export function registerRoutes(app: Express, ctx: AppContext) {
  app.use(onboardingRoutes(ctx));
  app.use(myJournalRoutes(ctx));
  app.use(journalingRoutes(ctx));
  app.use(portfolioRoutes(ctx));
  app.use(transactionLogsRoutes(ctx));
  app.use(reminderRoutes(ctx));
  app.use(targetAmountRoutes(ctx));
  app.use(savedPlanRoutes(ctx));
  app.use(settingPageRoutes(ctx));
  app.use(trashRoutes(ctx));
  app.use(assetsRoutes(ctx));
}

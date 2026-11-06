import type { Express } from 'express';
import type { AppContext } from '../context.js';
import { onboardingRoutes } from './onboarding/onboarding.js';
import { myJournalRoutes } from './my-journal/my-journal.js';
import { journalingRoutes } from './journaling/journaling.js';
import { portfolioRoutes } from './portfolio/portfolio.js';
import { transactionLogsRoutes } from './transaction-logs/transaction-logs.js';
import { reminderRoutes } from './reminder/reminder.js';
import { targetAmountRoutes } from './target-amount/target-amount.js';
import { savedPlanRoutes } from './saved-plan/saved-plan.js';
import { settingPageRoutes } from './setting-page/setting-page.js';
import { trashRoutes } from './trash/trash.js';
import { assetsRoutes } from './assets/assets.js';

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

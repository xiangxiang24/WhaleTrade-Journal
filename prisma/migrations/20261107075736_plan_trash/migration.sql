-- AlterTable
ALTER TABLE "CalcPlan" ADD COLUMN "deletedAt" DATETIME;

-- CreateIndex
CREATE INDEX "CalcPlan_userId_deletedAt_idx" ON "CalcPlan"("userId", "deletedAt");

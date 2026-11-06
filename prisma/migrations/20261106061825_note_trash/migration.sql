-- AlterTable
ALTER TABLE "Note" ADD COLUMN "deletedAt" DATETIME;

-- CreateIndex
CREATE INDEX "Note_userId_deletedAt_idx" ON "Note"("userId", "deletedAt");

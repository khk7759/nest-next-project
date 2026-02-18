-- AlterTable
ALTER TABLE "challenges" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "challenges_order_idx" ON "challenges"("order");

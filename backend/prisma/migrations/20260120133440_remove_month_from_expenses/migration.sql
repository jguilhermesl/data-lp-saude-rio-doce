/*
  Warnings:

  - You are about to drop the column `month` on the `expenses` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "expenses_month_idx";

-- AlterTable
ALTER TABLE "expenses" DROP COLUMN "month";

-- CreateEnum
CREATE TYPE "SatisfactionLevel" AS ENUM ('NEUTRAL', 'SATISFIED', 'UNSATISFIED');

-- AlterTable
ALTER TABLE "message_dispatch_items" ADD COLUMN     "satisfactionLevel" "SatisfactionLevel" NOT NULL DEFAULT 'NEUTRAL';

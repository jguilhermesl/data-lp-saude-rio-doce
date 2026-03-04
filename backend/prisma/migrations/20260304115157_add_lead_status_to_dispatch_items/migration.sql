-- CreateEnum
CREATE TYPE "LeadResponseStatus" AS ENUM ('NOT_CONTACTED', 'NO_RESPONSE', 'RESPONDED', 'INTERESTED', 'NOT_INTERESTED', 'SCHEDULED');

-- AlterTable
ALTER TABLE "message_dispatch_items" ADD COLUMN     "leadStatus" "LeadResponseStatus" NOT NULL DEFAULT 'NOT_CONTACTED';

/*
  Warnings:

  - The values [NOT_CONTACTED] on the enum `LeadResponseStatus` will be removed. If these variants are still used in the database, this will fail.

*/

-- Primeiro, atualiza todos os registros NOT_CONTACTED para NO_RESPONSE
UPDATE "message_dispatch_items" SET "leadStatus" = 'NO_RESPONSE' WHERE "leadStatus" = 'NOT_CONTACTED';

-- AlterEnum
BEGIN;
CREATE TYPE "LeadResponseStatus_new" AS ENUM ('NO_RESPONSE', 'RESPONDED', 'INTERESTED', 'NOT_INTERESTED', 'SCHEDULED');
ALTER TABLE "message_dispatch_items" ALTER COLUMN "leadStatus" DROP DEFAULT;
ALTER TABLE "message_dispatch_items" ALTER COLUMN "leadStatus" TYPE "LeadResponseStatus_new" USING ("leadStatus"::text::"LeadResponseStatus_new");
ALTER TYPE "LeadResponseStatus" RENAME TO "LeadResponseStatus_old";
ALTER TYPE "LeadResponseStatus_new" RENAME TO "LeadResponseStatus";
DROP TYPE "LeadResponseStatus_old";
ALTER TABLE "message_dispatch_items" ALTER COLUMN "leadStatus" SET DEFAULT 'NO_RESPONSE';
COMMIT;

-- AlterTable
ALTER TABLE "message_dispatch_items" ALTER COLUMN "leadStatus" SET DEFAULT 'NO_RESPONSE';

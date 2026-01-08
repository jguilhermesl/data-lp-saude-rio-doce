/*
  Warnings:

  - Made the column `externalId` on table `procedures` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sourceSystem` on table `procedures` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "procedures" ADD COLUMN     "ch" TEXT,
ADD COLUMN     "specialtyId" TEXT,
ADD COLUMN     "specialtyName" TEXT,
ALTER COLUMN "externalId" SET NOT NULL,
ALTER COLUMN "sourceSystem" SET NOT NULL;

-- CreateIndex
CREATE INDEX "procedures_specialtyId_idx" ON "procedures"("specialtyId");

-- AddForeignKey
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `acronym` on the `specialties` table. All the data in the column will be lost.
  - You are about to drop the column `commissionType` on the `specialties` table. All the data in the column will be lost.
  - You are about to drop the column `commissionValue` on the `specialties` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `specialties` table. All the data in the column will be lost.
  - Made the column `externalId` on table `specialties` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sourceSystem` on table `specialties` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "specialties" DROP COLUMN "acronym",
DROP COLUMN "commissionType",
DROP COLUMN "commissionValue",
DROP COLUMN "description",
ALTER COLUMN "externalId" SET NOT NULL,
ALTER COLUMN "sourceSystem" SET NOT NULL;

-- DropEnum
DROP TYPE "CommissionType";

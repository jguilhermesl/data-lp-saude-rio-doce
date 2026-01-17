/*
  Warnings:

  - You are about to drop the column `totalPrice` on the `appointment_procedures` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `appointment_procedures` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "appointment_procedures" DROP COLUMN "totalPrice",
DROP COLUMN "unitPrice";

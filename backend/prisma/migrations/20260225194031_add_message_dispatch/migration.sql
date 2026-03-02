-- CreateEnum
CREATE TYPE "CadenceType" AS ENUM ('THIRTY_DAYS', 'SIXTY_DAYS', 'NINETY_DAYS');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ');

-- CreateTable
CREATE TABLE "message_dispatches" (
    "id" TEXT NOT NULL,
    "cadence" "CadenceType" NOT NULL,
    "status" "DispatchStatus" NOT NULL DEFAULT 'PENDING',
    "totalPatients" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_dispatch_items" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "messageTemplate" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "whatsappMessageId" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_dispatch_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_dispatches_cadence_idx" ON "message_dispatches"("cadence");

-- CreateIndex
CREATE INDEX "message_dispatches_date_idx" ON "message_dispatches"("date");

-- CreateIndex
CREATE INDEX "message_dispatches_status_idx" ON "message_dispatches"("status");

-- CreateIndex
CREATE INDEX "message_dispatch_items_dispatchId_idx" ON "message_dispatch_items"("dispatchId");

-- CreateIndex
CREATE INDEX "message_dispatch_items_patientId_idx" ON "message_dispatch_items"("patientId");

-- CreateIndex
CREATE INDEX "message_dispatch_items_status_idx" ON "message_dispatch_items"("status");

-- CreateIndex
CREATE INDEX "message_dispatch_items_phoneNumber_idx" ON "message_dispatch_items"("phoneNumber");

-- AddForeignKey
ALTER TABLE "message_dispatch_items" ADD CONSTRAINT "message_dispatch_items_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "message_dispatches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_dispatch_items" ADD CONSTRAINT "message_dispatch_items_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

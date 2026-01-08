-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('PERCENTAGE', 'FIXED', 'OTHER');

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "identityNumber" TEXT,
    "cpf" TEXT,
    "homePhone" TEXT,
    "mobilePhone" TEXT,
    "syncedAt" TIMESTAMP(3),
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "crm" TEXT,
    "syncedAt" TIMESTAMP(3),
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "sourceSystem" TEXT,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "description" TEXT,
    "commissionValue" DECIMAL(10,2),
    "commissionType" "CommissionType",
    "syncedAt" TIMESTAMP(3),
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedures" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "sourceSystem" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "defaultPrice" DECIMAL(10,2),
    "syncedAt" TIMESTAMP(3),
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "appointmentDate" DATE NOT NULL,
    "appointmentTime" TEXT,
    "appointmentAt" TIMESTAMP(3),
    "createdDate" DATE,
    "insuranceName" TEXT,
    "examValue" DECIMAL(10,2),
    "paidValue" DECIMAL(10,2),
    "paymentDone" BOOLEAN NOT NULL DEFAULT false,
    "examsRaw" TEXT,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "responsibleUserId" TEXT,
    "specialtyId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "name" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_specialties" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_procedures" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    "quantity" INTEGER DEFAULT 1,
    "unitPrice" DECIMAL(10,2),
    "totalPrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_procedures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "patients_cpf_idx" ON "patients"("cpf");

-- CreateIndex
CREATE INDEX "patients_fullName_idx" ON "patients"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "patients_externalId_sourceSystem_key" ON "patients"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "doctors_name_idx" ON "doctors"("name");

-- CreateIndex
CREATE INDEX "doctors_crm_idx" ON "doctors"("crm");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_externalId_sourceSystem_key" ON "doctors"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "specialties_name_idx" ON "specialties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "specialty_external_unique" ON "specialties"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "procedures_name_idx" ON "procedures"("name");

-- CreateIndex
CREATE INDEX "procedures_code_idx" ON "procedures"("code");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_external_unique" ON "procedures"("externalId", "sourceSystem");

-- CreateIndex
CREATE INDEX "appointments_appointmentDate_idx" ON "appointments"("appointmentDate");

-- CreateIndex
CREATE INDEX "appointments_patientId_idx" ON "appointments"("patientId");

-- CreateIndex
CREATE INDEX "appointments_doctorId_idx" ON "appointments"("doctorId");

-- CreateIndex
CREATE INDEX "appointments_responsibleUserId_idx" ON "appointments"("responsibleUserId");

-- CreateIndex
CREATE INDEX "appointments_specialtyId_idx" ON "appointments"("specialtyId");

-- CreateIndex
CREATE INDEX "appointments_paymentDone_idx" ON "appointments"("paymentDone");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_externalId_sourceSystem_key" ON "appointments"("externalId", "sourceSystem");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "doctor_specialties_doctorId_idx" ON "doctor_specialties"("doctorId");

-- CreateIndex
CREATE INDEX "doctor_specialties_specialtyId_idx" ON "doctor_specialties"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_specialties_doctorId_specialtyId_key" ON "doctor_specialties"("doctorId", "specialtyId");

-- CreateIndex
CREATE INDEX "appointment_procedures_appointmentId_idx" ON "appointment_procedures"("appointmentId");

-- CreateIndex
CREATE INDEX "appointment_procedures_procedureId_idx" ON "appointment_procedures"("procedureId");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_procedures_appointmentId_procedureId_key" ON "appointment_procedures"("appointmentId", "procedureId");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialties" ADD CONSTRAINT "doctor_specialties_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialties" ADD CONSTRAINT "doctor_specialties_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_procedures" ADD CONSTRAINT "appointment_procedures_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_procedures" ADD CONSTRAINT "appointment_procedures_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

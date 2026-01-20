import { prisma } from '../lib/prisma';
import { Prisma, Patient } from '@prisma/client';

/**
 * PatientDAO - Data Access Object para operações relacionadas a pacientes
 */
export class PatientDAO {
  // ========== CRUD BÁSICO ==========

  /**
   * Busca um único paciente
   */
  async findOne(
    where: Prisma.PatientWhereInput,
    include?: Prisma.PatientInclude
  ): Promise<Patient | null> {
    try {
      return await prisma.patient.findFirst({ where, include });
    } catch (error) {
      console.error('Error in PatientDAO.findOne:', error);
      throw error;
    }
  }

  /**
   * Busca múltiplos pacientes
   */
  async findMany(
    where?: Prisma.PatientWhereInput,
    include?: Prisma.PatientInclude,
    orderBy?: Prisma.PatientOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<Patient[]> {
    try {
      return await prisma.patient.findMany({
        where,
        include,
        orderBy,
        skip,
        take,
      });
    } catch (error) {
      console.error('Error in PatientDAO.findMany:', error);
      throw error;
    }
  }

  /**
   * Busca paciente por ID
   */
  async findById(id: string, include?: Prisma.PatientInclude): Promise<Patient | null> {
    return this.findOne({ id }, include);
  }

  /**
   * Conta o número de pacientes
   */
  async count(where?: Prisma.PatientWhereInput): Promise<number> {
    try {
      return await prisma.patient.count({ where });
    } catch (error) {
      console.error('Error in PatientDAO.count:', error);
      throw error;
    }
  }

  // ========== MÉTODOS PARA MÉTRICAS ==========

  /**
   * Segmentação de pacientes (novos vs recorrentes)
   */
  async getPatientSegmentation(startDate: Date, endDate: Date) {
    try {
      const patients = await prisma.patient.findMany({
        include: {
          appointments: {
            where: {
              appointmentDate: { gte: startDate, lte: endDate },
            },
            select: {
              id: true,
              appointmentDate: true,
              examValue: true,
            },
            orderBy: {
              appointmentDate: 'asc',
            },
          },
        },
      });

      return patients.map((patient) => {
        const appointmentCount = patient.appointments.length;
        const firstAppointment = patient.appointments[0];
        const lastAppointment = patient.appointments[appointmentCount - 1];

        return {
          id: patient.id,
          fullName: patient.fullName,
          cpf: patient.cpf,
          appointmentCount,
          isNew: appointmentCount === 1,
          isRecurring: appointmentCount > 1,
          firstAppointmentDate: firstAppointment?.appointmentDate,
          lastAppointmentDate: lastAppointment?.appointmentDate,
          totalSpent: patient.appointments.reduce(
            (sum, apt) => sum + Number(apt.examValue || 0),
            0
          ),
        };
      });
    } catch (error) {
      console.error('Error in PatientDAO.getPatientSegmentation:', error);
      throw error;
    }
  }


  /**
   * Pacientes em risco de churn (sem atendimento há X meses)
   */
  async getPatientsAtRisk(monthsWithoutAppointment: number = 3) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsWithoutAppointment);

      // Buscar pacientes cujo último atendimento foi antes da data de corte
      const patientsAtRisk = await prisma.patient.findMany({
        where: {
          appointments: {
            some: {},
          },
        },
        include: {
          appointments: {
            orderBy: { appointmentDate: 'desc' },
            take: 1,
            select: {
              appointmentDate: true,
            },
          },
        },
      });

      return patientsAtRisk
        .filter((patient) => {
          const lastAppointment = patient.appointments[0];
          return lastAppointment && lastAppointment.appointmentDate < cutoffDate;
        })
        .map((patient) => ({
          id: patient.id,
          fullName: patient.fullName,
          cpf: patient.cpf,
          lastAppointmentDate: patient.appointments[0]?.appointmentDate,
          daysSinceLastAppointment: Math.floor(
            (new Date().getTime() - patient.appointments[0]?.appointmentDate.getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        }));
    } catch (error) {
      console.error('Error in PatientDAO.getPatientsAtRisk:', error);
      throw error;
    }
  }

  /**
   * Novos pacientes no período
   */
  async getNewPatients(startDate: Date, endDate: Date) {
    try {
      // Pacientes cujo primeiro atendimento foi no período
      const allPatients = await prisma.patient.findMany({
        include: {
          appointments: {
            orderBy: { appointmentDate: 'asc' },
            take: 1,
          },
        },
      });

      return allPatients.filter((patient) => {
        const firstAppointment = patient.appointments[0];
        return (
          firstAppointment &&
          firstAppointment.appointmentDate >= startDate &&
          firstAppointment.appointmentDate <= endDate
        );
      }).length;
    } catch (error) {
      console.error('Error in PatientDAO.getNewPatients:', error);
      throw error;
    }
  }

  /**
   * Taxa de retorno geral
   */
  async getReturnRate() {
    try {
      const allPatients = await prisma.patient.findMany({
        include: {
          _count: {
            select: { appointments: true },
          },
        },
      });

      const totalPatients = allPatients.length;
      const recurringPatients = allPatients.filter((p) => p._count.appointments > 1).length;

      return {
        totalPatients,
        recurringPatients,
        newPatients: totalPatients - recurringPatients,
        returnRate: totalPatients > 0 ? (recurringPatients / totalPatients) * 100 : 0,
      };
    } catch (error) {
      console.error('Error in PatientDAO.getReturnRate:', error);
      throw error;
    }
  }
}

export const patientDAO = new PatientDAO();

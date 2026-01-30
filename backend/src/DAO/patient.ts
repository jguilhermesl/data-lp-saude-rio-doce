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
   * Novos: pacientes cujo PRIMEIRO atendimento foi no período
   * Recorrentes: pacientes que tiveram atendimentos no período mas o primeiro foi ANTES
   */
  async getPatientSegmentation(startDate: Date, endDate: Date) {
    try {
      // Buscar pacientes que tiveram atendimentos no período
      const patientsInPeriod = await prisma.patient.findMany({
        where: {
          appointments: {
            some: {
              appointmentDate: { gte: startDate, lte: endDate },
            },
          },
        },
        include: {
          appointments: {
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

      return patientsInPeriod.map((patient) => {
        // Todos os atendimentos do paciente (histórico completo)
        const allAppointments = patient.appointments;
        const firstEverAppointment = allAppointments[0];
        
        // Atendimentos no período
        const appointmentsInPeriod = allAppointments.filter(
          (apt) => apt.appointmentDate >= startDate && apt.appointmentDate <= endDate
        );

        // É novo se o primeiro atendimento de toda a vida foi no período
        const isNew = firstEverAppointment && 
                     firstEverAppointment.appointmentDate >= startDate && 
                     firstEverAppointment.appointmentDate <= endDate;

        // É recorrente se teve atendimento no período mas o primeiro foi antes
        const isRecurring = firstEverAppointment && 
                           firstEverAppointment.appointmentDate < startDate &&
                           appointmentsInPeriod.length > 0;

        const lastAppointmentInPeriod = appointmentsInPeriod[appointmentsInPeriod.length - 1];

        return {
          id: patient.id,
          fullName: patient.fullName,
          cpf: patient.cpf,
          appointmentCount: appointmentsInPeriod.length,
          isNew,
          isRecurring,
          firstAppointmentDate: firstEverAppointment?.appointmentDate,
          lastAppointmentDate: lastAppointmentInPeriod?.appointmentDate,
          totalSpent: appointmentsInPeriod.reduce(
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
  async getPatientsAtRisk(
    monthsWithoutAppointment: number = 3,
    doctorId?: string,
    procedureId?: string
  ) {
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
            include: {
              doctor: {
                select: {
                  id: true,
                  name: true,
                },
              },
              specialty: {
                select: {
                  id: true,
                  name: true,
                },
              },
              appointmentProcedures: {
                include: {
                  procedure: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return patientsAtRisk
        .filter((patient) => {
          const lastAppointment = patient.appointments[0];
          if (!lastAppointment || lastAppointment.appointmentDate >= cutoffDate) {
            return false;
          }

          // Filtrar por médico se especificado
          if (doctorId && lastAppointment.doctorId !== doctorId) {
            return false;
          }

          // Filtrar por procedimento se especificado
          if (procedureId) {
            const hasProcedure = lastAppointment.appointmentProcedures.some(
              (ap) => ap.procedure.id === procedureId
            );
            if (!hasProcedure) {
              return false;
            }
          }

          return true;
        })
        .map((patient) => {
          const lastAppointment = patient.appointments[0];
          return {
            id: patient.id,
            fullName: patient.fullName,
            cpf: patient.cpf,
            homePhone: patient.homePhone,
            mobilePhone: patient.mobilePhone,
            lastAppointmentDate: lastAppointment.appointmentDate,
            daysSinceLastAppointment: Math.floor(
              (new Date().getTime() - lastAppointment.appointmentDate.getTime()) /
                (1000 * 60 * 60 * 24)
            ),
            lastDoctorId: lastAppointment.doctor?.id || null,
            lastDoctorName: lastAppointment.doctor?.name || null,
            lastSpecialtyName: lastAppointment.specialty?.name || null,
            lastProcedures: lastAppointment.appointmentProcedures.map((ap) => ({
              id: ap.procedure.id,
              name: ap.procedure.name,
            })),
          };
        });
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

}

export const patientDAO = new PatientDAO();

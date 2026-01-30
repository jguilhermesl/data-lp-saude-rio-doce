import { prisma } from '../lib/prisma';
import { Prisma, Doctor } from '@prisma/client';

/**
 * DoctorDAO - Data Access Object para operações relacionadas a médicos
 */
export class DoctorDAO {
  // ========== CRUD BÁSICO ==========

  /**
   * Busca um único médico
   */
  async findOne(
    where: Prisma.DoctorWhereInput,
    include?: Prisma.DoctorInclude
  ): Promise<Doctor | null> {
    try {
      return await prisma.doctor.findFirst({ where, include });
    } catch (error) {
      console.error('Error in DoctorDAO.findOne:', error);
      throw error;
    }
  }

  /**
   * Busca múltiplos médicos
   */
  async findMany(
    where?: Prisma.DoctorWhereInput,
    include?: Prisma.DoctorInclude,
    orderBy?: Prisma.DoctorOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<Doctor[]> {
    try {
      return await prisma.doctor.findMany({
        where,
        include,
        orderBy,
        skip,
        take,
      });
    } catch (error) {
      console.error('Error in DoctorDAO.findMany:', error);
      throw error;
    }
  }

  /**
   * Busca médico por ID
   */
  async findById(id: string, include?: Prisma.DoctorInclude): Promise<Doctor | null> {
    return this.findOne({ id }, include);
  }

  /**
   * Conta o número de médicos
   */
  async count(where?: Prisma.DoctorWhereInput): Promise<number> {
    try {
      return await prisma.doctor.count({ where });
    } catch (error) {
      console.error('Error in DoctorDAO.count:', error);
      throw error;
    }
  }

  // ========== MÉTODOS PARA MÉTRICAS ==========

  /**
   * Performance de todos os médicos com dados de atendimentos
   */
  async getDoctorsPerformance(startDate: Date, endDate: Date) {
    try {
      return await prisma.doctor.findMany({
        include: {
          appointments: {
            where: {
              appointmentDate: { gte: startDate, lte: endDate },
            },
            select: {
              id: true,
              examValue: true,
              paidValue: true,
              patientId: true,
              appointmentDate: true,
            },
          },
          doctorSpecialties: {
            include: {
              specialty: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('Error in DoctorDAO.getDoctorsPerformance:', error);
      throw error;
    }
  }


  /**
   * Médicos com mais atendimentos
   */
  async getTopDoctorsByAppointments(startDate: Date, endDate: Date, limit: number = 10) {
    try {
      return await prisma.appointment.groupBy({
        by: ['doctorId'],
        where: {
          appointmentDate: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
        orderBy: {
          _count: { id: 'desc' },
        },
        take: limit,
      });
    } catch (error) {
      console.error('Error in DoctorDAO.getTopDoctorsByAppointments:', error);
      throw error;
    }
  }

  /**
   * Médicos com maior faturamento
   */
  async getTopDoctorsByRevenue(startDate: Date, endDate: Date, limit: number = 10) {
    try {
      return await prisma.appointment.groupBy({
        by: ['doctorId'],
        where: {
          appointmentDate: { gte: startDate, lte: endDate },
        },
        _sum: { examValue: true },
        orderBy: {
          _sum: { examValue: 'desc' },
        },
        take: limit,
      });
    } catch (error) {
      console.error('Error in DoctorDAO.getTopDoctorsByRevenue:', error);
      throw error;
    }
  }

  /**
   * Produtividade do médico (atendimentos por período)
   */
  async getDoctorProductivity(doctorId: string, startDate: Date, endDate: Date) {
    try {
      const appointments = await prisma.appointment.count({
        where: {
          doctorId,
          appointmentDate: { gte: startDate, lte: endDate },
        },
      });

      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const appointmentsPerDay = daysDiff > 0 ? appointments / daysDiff : 0;

      return {
        totalAppointments: appointments,
        days: daysDiff,
        appointmentsPerDay,
      };
    } catch (error) {
      console.error('Error in DoctorDAO.getDoctorProductivity:', error);
      throw error;
    }
  }
}

export const doctorDAO = new DoctorDAO();

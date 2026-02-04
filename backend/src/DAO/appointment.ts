import { prisma } from '../lib/prisma';
import { Prisma, Appointment } from '@prisma/client';

/**
 * AppointmentDAO - Data Access Object para operações relacionadas a atendimentos
 */
export class AppointmentDAO {
  // ========== CRUD BÁSICO ==========

  /**
   * Busca um único atendimento
   */
  async findOne(
    where: Prisma.AppointmentWhereInput,
    include?: Prisma.AppointmentInclude
  ): Promise<Appointment | null> {
    try {
      return await prisma.appointment.findFirst({ where, include });
    } catch (error) {
      console.error('Error in AppointmentDAO.findOne:', error);
      throw error;
    }
  }

  /**
   * Busca múltiplos atendimentos
   */
  async findMany(
    where?: Prisma.AppointmentWhereInput,
    include?: Prisma.AppointmentInclude,
    orderBy?: Prisma.AppointmentOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<Appointment[]> {
    try {
      return await prisma.appointment.findMany({
        where,
        include,
        orderBy,
        skip,
        take,
      });
    } catch (error) {
      console.error('Error in AppointmentDAO.findMany:', error);
      throw error;
    }
  }

  /**
   * Busca atendimento por ID
   */
  async findById(id: string, include?: Prisma.AppointmentInclude): Promise<Appointment | null> {
    return this.findOne({ id }, include);
  }

  /**
   * Conta o número de atendimentos
   */
  async count(where?: Prisma.AppointmentWhereInput): Promise<number> {
    try {
      return await prisma.appointment.count({ where });
    } catch (error) {
      console.error('Error in AppointmentDAO.count:', error);
      throw error;
    }
  }

  // ========== MÉTODOS PARA MÉTRICAS ==========

  /**
   * Métricas financeiras dos atendimentos
   */
  async getFinancialMetrics(startDate: Date, endDate: Date, filters?: any) {
    try {
      return await prisma.appointment.aggregate({
        where: {
          appointmentDate: { gte: startDate, lte: endDate },
          ...filters,
        },
        _sum: { examValue: true, paidValue: true },
        _avg: { examValue: true, paidValue: true },
        _count: { id: true },
      });
    } catch (error) {
      console.error('Error in AppointmentDAO.getFinancialMetrics:', error);
      throw error;
    }
  }

  /**
   * Atendimentos agrupados por status de pagamento
   */
  async getPaymentStatus(startDate: Date, endDate: Date) {
    try {
      return await prisma.appointment.groupBy({
        by: ['paymentDone'],
        where: {
          appointmentDate: { gte: startDate, lte: endDate },
        },
        _sum: { examValue: true, paidValue: true },
        _count: { id: true },
      });
    } catch (error) {
      console.error('Error in AppointmentDAO.getPaymentStatus:', error);
      throw error;
    }
  }

  /**
   * Atendimentos por convênio
   */
  async getByInsurance(startDate: Date, endDate: Date) {
    try {
      return await prisma.$queryRaw<Array<{
        insuranceName: string;
        _sum: { examValue: number | null; paidValue: number | null };
        _count: { id: number };
      }>>`
        SELECT 
          "insuranceName",
          json_build_object(
            'examValue', SUM("examValue"),
            'paidValue', SUM("paidValue")
          ) as "_sum",
          json_build_object('id', COUNT(*)::int) as "_count"
        FROM appointments
        WHERE "appointmentDate" BETWEEN ${startDate} AND ${endDate}
          AND "insuranceName" IS NOT NULL
        GROUP BY "insuranceName"
        ORDER BY "insuranceName"
      `;
    } catch (error) {
      console.error('Error in AppointmentDAO.getByInsurance:', error);
      throw error;
    }
  }

  /**
   * Atendimentos por médico
   */
  async getByDoctor(startDate: Date, endDate: Date) {
    try {
      return await prisma.$queryRaw<Array<{
        doctorId: string;
        _sum: { examValue: number | null; paidValue: number | null };
        _count: { id: number };
        _avg: { examValue: number | null };
      }>>`
        SELECT 
          "doctorId",
          json_build_object(
            'examValue', SUM("examValue"),
            'paidValue', SUM("paidValue")
          ) as "_sum",
          json_build_object('id', COUNT(*)::int) as "_count",
          json_build_object('examValue', AVG("examValue")) as "_avg"
        FROM appointments
        WHERE "appointmentDate" BETWEEN ${startDate} AND ${endDate}
          AND "doctorId" IS NOT NULL
        GROUP BY "doctorId"
        ORDER BY "doctorId"
      `;
    } catch (error) {
      console.error('Error in AppointmentDAO.getByDoctor:', error);
      throw error;
    }
  }

  /**
   * Evolução temporal (para gráficos)
   */
  async getTimeSeriesData(startDate: Date, endDate: Date, groupBy: 'day' | 'month' | 'year' = 'month') {
    try {
      return await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC(${groupBy}, "appointmentDate") as period,
          COUNT(*)::int as count,
          SUM("examValue")::float as revenue,
          SUM("paidValue")::float as received
        FROM appointments
        WHERE "appointmentDate" BETWEEN ${startDate} AND ${endDate}
        GROUP BY period
        ORDER BY period
      `;
    } catch (error) {
      console.error('Error in AppointmentDAO.getTimeSeriesData:', error);
      throw error;
    }
  }

  /**
   * Atendimentos hoje
   */
  async getTodayAppointments() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return await this.count({
        appointmentDate: {
          gte: today,
          lt: tomorrow,
        },
      });
    } catch (error) {
      console.error('Error in AppointmentDAO.getTodayAppointments:', error);
      throw error;
    }
  }

  /**
   * Atendimentos da semana
   */
  async getWeekAppointments() {
    try {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      return await this.count({
        appointmentDate: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      });
    } catch (error) {
      console.error('Error in AppointmentDAO.getWeekAppointments:', error);
      throw error;
    }
  }
}

export const appointmentDAO = new AppointmentDAO();

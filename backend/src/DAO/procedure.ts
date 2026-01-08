import { prisma } from '../lib/prisma';
import { Prisma, Procedure } from '@prisma/client';

/**
 * ProcedureDAO - Data Access Object para operações relacionadas a procedimentos
 */
export class ProcedureDAO {
  // ========== CRUD BÁSICO ==========

  /**
   * Busca um único procedimento
   */
  async findOne(
    where: Prisma.ProcedureWhereInput,
    include?: Prisma.ProcedureInclude
  ): Promise<Procedure | null> {
    try {
      return await prisma.procedure.findFirst({ where, include });
    } catch (error) {
      console.error('Error in ProcedureDAO.findOne:', error);
      throw error;
    }
  }

  /**
   * Busca múltiplos procedimentos
   */
  async findMany(
    where?: Prisma.ProcedureWhereInput,
    include?: Prisma.ProcedureInclude,
    orderBy?: Prisma.ProcedureOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<Procedure[]> {
    try {
      return await prisma.procedure.findMany({
        where,
        include,
        orderBy,
        skip,
        take,
      });
    } catch (error) {
      console.error('Error in ProcedureDAO.findMany:', error);
      throw error;
    }
  }

  /**
   * Busca procedimento por ID
   */
  async findById(id: string, include?: Prisma.ProcedureInclude): Promise<Procedure | null> {
    return this.findOne({ id }, include);
  }

  /**
   * Conta o número de procedimentos
   */
  async count(where?: Prisma.ProcedureWhereInput): Promise<number> {
    try {
      return await prisma.procedure.count({ where });
    } catch (error) {
      console.error('Error in ProcedureDAO.count:', error);
      throw error;
    }
  }

  // ========== MÉTODOS PARA MÉTRICAS ==========

  /**
   * Procedimentos mais vendidos (por quantidade)
   */
  async getTopSellingProcedures(startDate: Date, endDate: Date, limit: number = 10) {
    try {
      return await prisma.appointmentProcedure.groupBy({
        by: ['procedureId'],
        where: {
          appointment: {
            appointmentDate: { gte: startDate, lte: endDate },
          },
        },
        _sum: { totalPrice: true, quantity: true },
        _count: { id: true },
        _avg: { unitPrice: true },
        orderBy: {
          _count: { id: 'desc' },
        },
        take: limit,
      });
    } catch (error) {
      console.error('Error in ProcedureDAO.getTopSellingProcedures:', error);
      throw error;
    }
  }

  /**
   * Procedimentos com maior faturamento
   */
  async getTopRevenueProcedures(startDate: Date, endDate: Date, limit: number = 10) {
    try {
      return await prisma.appointmentProcedure.groupBy({
        by: ['procedureId'],
        where: {
          appointment: {
            appointmentDate: { gte: startDate, lte: endDate },
          },
        },
        _sum: { totalPrice: true, quantity: true },
        _count: { id: true },
        _avg: { unitPrice: true },
        orderBy: {
          _sum: { totalPrice: 'desc' },
        },
        take: limit,
      });
    } catch (error) {
      console.error('Error in ProcedureDAO.getTopRevenueProcedures:', error);
      throw error;
    }
  }

  /**
   * Combos de procedimentos (frequentemente vendidos juntos)
   */
  async getProcedureCombos(minOccurrences: number = 3) {
    try {
      return await prisma.$queryRaw`
        SELECT 
          ap1."procedureId" as procedure1_id,
          ap2."procedureId" as procedure2_id,
          COUNT(*)::int as occurrences
        FROM appointment_procedures ap1
        JOIN appointment_procedures ap2 
          ON ap1."appointmentId" = ap2."appointmentId" 
          AND ap1."procedureId" < ap2."procedureId"
        GROUP BY ap1."procedureId", ap2."procedureId"
        HAVING COUNT(*) >= ${minOccurrences}
        ORDER BY occurrences DESC
        LIMIT 20
      `;
    } catch (error) {
      console.error('Error in ProcedureDAO.getProcedureCombos:', error);
      throw error;
    }
  }

  /**
   * Estatísticas de um procedimento específico
   */
  async getProcedureStats(procedureId: string, startDate: Date, endDate: Date) {
    try {
      const stats = await prisma.appointmentProcedure.aggregate({
        where: {
          procedureId,
          appointment: {
            appointmentDate: { gte: startDate, lte: endDate },
          },
        },
        _sum: { totalPrice: true, quantity: true },
        _avg: { unitPrice: true },
        _count: { id: true },
      });

      return {
        procedureId,
        totalRevenue: Number(stats._sum.totalPrice || 0),
        totalQuantity: stats._sum.quantity || 0,
        timesOrdered: stats._count.id,
        averagePrice: Number(stats._avg.unitPrice || 0),
      };
    } catch (error) {
      console.error('Error in ProcedureDAO.getProcedureStats:', error);
      throw error;
    }
  }

  /**
   * Tendência de procedimento (crescimento/declínio)
   */
  async getProcedureTrend(procedureId: string, currentStartDate: Date, currentEndDate: Date) {
    try {
      // Período atual
      const currentPeriod = await this.getProcedureStats(
        procedureId,
        currentStartDate,
        currentEndDate
      );

      // Período anterior (mesmo tamanho)
      const daysDiff = Math.ceil(
        (currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const previousStartDate = new Date(currentStartDate);
      previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
      const previousEndDate = new Date(currentStartDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);

      const previousPeriod = await this.getProcedureStats(
        procedureId,
        previousStartDate,
        previousEndDate
      );

      // Calcular tendência
      const revenueGrowth =
        previousPeriod.totalRevenue > 0
          ? ((currentPeriod.totalRevenue - previousPeriod.totalRevenue) /
              previousPeriod.totalRevenue) *
            100
          : 0;

      const quantityGrowth =
        previousPeriod.totalQuantity > 0
          ? ((currentPeriod.totalQuantity - previousPeriod.totalQuantity) /
              previousPeriod.totalQuantity) *
            100
          : 0;

      return {
        current: currentPeriod,
        previous: previousPeriod,
        revenueGrowth,
        quantityGrowth,
        trend: revenueGrowth > 0 ? 'up' : revenueGrowth < 0 ? 'down' : 'stable',
      };
    } catch (error) {
      console.error('Error in ProcedureDAO.getProcedureTrend:', error);
      throw error;
    }
  }

  /**
   * Procedimentos por médico
   */
  async getProceduresByDoctor(startDate: Date, endDate: Date) {
    try {
      return await prisma.$queryRaw`
        SELECT 
          a."doctorId",
          ap."procedureId",
          COUNT(*)::int as times_ordered,
          SUM(ap."totalPrice")::float as total_revenue
        FROM appointment_procedures ap
        JOIN appointments a ON ap."appointmentId" = a.id
        WHERE a."appointmentDate" BETWEEN ${startDate} AND ${endDate}
        GROUP BY a."doctorId", ap."procedureId"
        ORDER BY total_revenue DESC
      `;
    } catch (error) {
      console.error('Error in ProcedureDAO.getProceduresByDoctor:', error);
      throw error;
    }
  }
}

export const procedureDAO = new ProcedureDAO();

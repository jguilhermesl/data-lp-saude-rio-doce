import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { procedureDAO } from '@/DAO/procedure';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const querySchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
});

export const getProceduresMetrics = async (req: any, res: any) => {
  try {
    const { startDate, endDate, page, limit, search } = querySchema.parse(req.query);

    // Construir filtros para busca de procedimentos
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Buscar métricas e TODOS os procedimentos (sem paginação ainda)
    const [topSelling, topRevenue, allProcedures, total] = await Promise.all([
      procedureDAO.getTopSellingProcedures(startDate, endDate, 10),
      procedureDAO.getTopRevenueProcedures(startDate, endDate, 10),
      procedureDAO.findMany(
        where,
        {
          _count: {
            select: {
              appointmentProcedures: true,
            },
          },
        },
        undefined, // Sem ordenação inicial
        undefined, // Sem skip
        undefined  // Sem limit - buscar todos
      ),
      procedureDAO.count(where),
    ]);

    // Buscar faturamento e quantidade de atendimentos no período para TODOS os procedimentos
    const procedureIds = allProcedures.map((p) => p.id);
    
    // Buscar appointment_procedures do período com os dados de appointments
    const appointmentProcedures = procedureIds.length > 0
      ? await prisma.appointmentProcedure.findMany({
          where: {
            procedureId: { in: procedureIds },
            appointment: {
              appointmentDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
          select: {
            procedureId: true,
            appointmentId: true,
            appointment: {
              select: {
                paidValue: true,
              },
            },
          },
        })
      : [];

    // Calcular métricas por procedimento
    const metricsMap = new Map<string, { totalRevenue: number; appointmentCount: number }>();
    
    for (const ap of appointmentProcedures) {
      const existing = metricsMap.get(ap.procedureId) || { totalRevenue: 0, appointmentCount: 0 };
      metricsMap.set(ap.procedureId, {
        totalRevenue: existing.totalRevenue + Number(ap.appointment.paidValue || 0),
        appointmentCount: existing.appointmentCount + 1,
      });
    }

    // Mapear métricas para todos os procedimentos e ordenar
    const allProceduresWithMetrics = allProcedures.map((procedure) => {
      const metrics = metricsMap.get(procedure.id);
      return {
        ...procedure,
        periodRevenue: metrics?.totalRevenue || 0,
        periodAppointmentCount: metrics?.appointmentCount || 0,
      };
    }).sort((a, b) => b.periodRevenue - a.periodRevenue); // Ordenar por faturamento no período (maior primeiro)

    // AGORA aplicar paginação nos resultados ordenados
    const skip = (page - 1) * limit;
    const proceduresWithMetrics = allProceduresWithMetrics.slice(skip, skip + limit);

    // Buscar nomes dos procedimentos para topSelling e topRevenue
    // Validar e filtrar apenas UUIDs válidos antes de criar o Set
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    const validTopSellingIds = topSelling
      .map((p) => p.procedureId)
      .filter((id) => id && typeof id === 'string' && uuidRegex.test(id));
    
    const validTopRevenueIds = topRevenue
      .map((p) => p.procedureId)
      .filter((id) => id && typeof id === 'string' && uuidRegex.test(id));
    
    const allProcedureIds = [
      ...new Set([
        ...validTopSellingIds,
        ...validTopRevenueIds,
      ]),
    ];

    const topProcedures = allProcedureIds.length > 0 
      ? await prisma.procedure.findMany({
          where: {
            id: { in: allProcedureIds },
          },
          select: {
            id: true,
            name: true,
            code: true,
            defaultPrice: true,
          },
        })
      : [];

    const getProcedureDetails = (id: string) => topProcedures.find((p) => p.id === id);

    // Processar top vendidos - filtrar apenas itens com procedureId válido
    const topSellingData = topSelling
      .filter((item) => item.procedureId && uuidRegex.test(item.procedureId))
      .map((item) => {
        const procedure = getProcedureDetails(item.procedureId);
        return {
          procedureId: item.procedureId,
          name: procedure?.name || 'Desconhecido',
          code: procedure?.code,
          quantitySold: item._sum.quantity || 0,
          timesOrdered: item._count.id,
          totalRevenue: Number(item._sum.totalRevenue || 0),
          averagePrice: Number(item._avg.paidValue || 0),
          defaultPrice: procedure?.defaultPrice ? Number(procedure.defaultPrice) : null,
        };
      });

    // Processar top faturamento - filtrar apenas itens com procedureId válido
    const topRevenueData = topRevenue
      .filter((item) => item.procedureId && uuidRegex.test(item.procedureId))
      .map((item) => {
        const procedure = getProcedureDetails(item.procedureId);
        return {
          procedureId: item.procedureId,
          name: procedure?.name || 'Desconhecido',
          code: procedure?.code,
          totalRevenue: Number(item._sum.totalRevenue || 0),
          quantitySold: item._sum.quantity || 0,
          timesOrdered: item._count.id,
          averagePrice: Number(item._avg.paidValue || 0),
          defaultPrice: procedure?.defaultPrice ? Number(procedure.defaultPrice) : null,
        };
      });

    // Calcular total de procedimentos (sem filtros de busca)
    const totalProcedures = await procedureDAO.count();

    // Resposta
    const response = {
      summary: {
        totalProcedures,
      },
      topSelling: topSellingData,
      topRevenue: topRevenueData,
      procedures: proceduresWithMetrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      period: {
        startDate,
        endDate,
      },
    };

    return res.status(200).send({ data: response });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

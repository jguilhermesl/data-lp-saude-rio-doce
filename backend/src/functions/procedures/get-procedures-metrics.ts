import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { procedureDAO } from '@/DAO/procedure';
import { prisma } from '@/lib/prisma';

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

    const skip = (page - 1) * limit;

    // Buscar métricas e procedimentos em paralelo
    const [topSelling, topRevenue, procedures, total] = await Promise.all([
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
        { name: 'asc' },
        skip,
        limit
      ),
      procedureDAO.count(where),
    ]);

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
      procedures: procedures,
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

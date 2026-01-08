import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { procedureDAO } from '@/DAO/procedure';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});

export const getProceduresMetrics = async (req: any, res: any) => {
  try {
    const { startDate, endDate } = querySchema.parse(req.query);

    // Buscar métricas em paralelo
    const [topSelling, topRevenue, combos] = await Promise.all([
      procedureDAO.getTopSellingProcedures(startDate, endDate, 10),
      procedureDAO.getTopRevenueProcedures(startDate, endDate, 10),
      procedureDAO.getProcedureCombos(3),
    ]);

    // Buscar nomes dos procedimentos
    const allProcedureIds = [
      ...new Set([
        ...topSelling.map((p) => p.procedureId),
        ...topRevenue.map((p) => p.procedureId),
      ]),
    ];

    const procedures = await prisma.procedure.findMany({
      where: {
        id: { in: allProcedureIds },
      },
      select: {
        id: true,
        name: true,
        code: true,
        defaultPrice: true,
      },
    });

    const getProcedureDetails = (id: string) => procedures.find((p) => p.id === id);

    // Processar top vendidos
    const topSellingData = topSelling.map((item) => {
      const procedure = getProcedureDetails(item.procedureId);
      return {
        procedureId: item.procedureId,
        name: procedure?.name || 'Desconhecido',
        code: procedure?.code,
        quantitySold: item._sum.quantity || 0,
        timesOrdered: item._count.id,
        totalRevenue: Number(item._sum.totalPrice || 0),
        averagePrice: Number(item._avg.unitPrice || 0),
        defaultPrice: procedure?.defaultPrice ? Number(procedure.defaultPrice) : null,
      };
    });

    // Processar top faturamento
    const topRevenueData = topRevenue.map((item) => {
      const procedure = getProcedureDetails(item.procedureId);
      return {
        procedureId: item.procedureId,
        name: procedure?.name || 'Desconhecido',
        code: procedure?.code,
        totalRevenue: Number(item._sum.totalPrice || 0),
        quantitySold: item._sum.quantity || 0,
        timesOrdered: item._count.id,
        averagePrice: Number(item._avg.unitPrice || 0),
      };
    });

    // Processar combos
    const combosData = await Promise.all(
      (combos as any[]).slice(0, 10).map(async (combo) => {
        const [proc1, proc2] = await Promise.all([
          prisma.procedure.findUnique({
            where: { id: combo.procedure1_id },
            select: { id: true, name: true },
          }),
          prisma.procedure.findUnique({
            where: { id: combo.procedure2_id },
            select: { id: true, name: true },
          }),
        ]);

        return {
          procedure1: {
            id: proc1?.id,
            name: proc1?.name || 'Desconhecido',
          },
          procedure2: {
            id: proc2?.id,
            name: proc2?.name || 'Desconhecido',
          },
          occurrences: combo.occurrences,
        };
      })
    );

    // Calcular métricas gerais
    const totalRevenue = topRevenueData.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalProcedures = await procedureDAO.count();
    const avgRevenuePerProcedure = topRevenueData.length > 0 ? totalRevenue / topRevenueData.length : 0;

    // Resposta
    const response = {
      summary: {
        totalProcedures,
        topSellingProcedure: topSellingData[0] || null,
        topRevenueProcedure: topRevenueData[0] || null,
        totalRevenueFromTop10: totalRevenue,
        avgRevenuePerProcedure,
      },
      topSelling: topSellingData,
      topRevenue: topRevenueData,
      combos: combosData,
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

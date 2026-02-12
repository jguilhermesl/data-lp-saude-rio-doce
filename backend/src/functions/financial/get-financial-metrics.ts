import { handleErrors } from '@/utils/handle-errors';
import { calculateTotalRevenue } from '@/utils/calculate-revenue';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, differenceInMonths, format } from 'date-fns';

const querySchema = z.object({
  startDate: z.string().min(1, 'startDate is required').transform((val) => {
    // Handle both ISO format (2026-02-01T00:00:00.000Z) and date-only format (2026-02-01)
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid startDate format. Expected ISO date string or YYYY-MM-DD');
    }
    // Ensure we use the start of the day
    return new Date(date.toISOString().split('T')[0] + 'T00:00:00.000Z');
  }),
  endDate: z.string().min(1, 'endDate is required').transform((val) => {
    // Handle both ISO format (2026-02-28T23:59:59.000Z) and date-only format (2026-02-28)
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid endDate format. Expected ISO date string or YYYY-MM-DD');
    }
    // Ensure we use the end of the day
    return new Date(date.toISOString().split('T')[0] + 'T23:59:59.999Z');
  }),
  category: z.string().optional(),
  search: z.string().optional(),
});

export const getFinancialMetrics = async (req: any, res: any) => {
  try {
    const { startDate, endDate, category, search } = querySchema.parse(req.query);

    // Construir filtros para expenses
    const expenseWhere: any = {
      date: { gte: startDate, lte: endDate },
    };

    if (category) {
      expenseWhere.category = category;
    }

    if (search) {
      expenseWhere.OR = [
        { payment: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    console.log("===> ",startDate, endDate)

    // Buscar dados em paralelo
    const [
      appointments,
      expenses,
      expenseSummary,
      categoryRanking,
    ] = await Promise.all([
      // Buscar appointments para calcular faturamento (appointmentDate OR createdDate)
      prisma.appointment.findMany({
        where: {
          OR: [
            { appointmentDate: { gte: startDate, lte: endDate } },
            { createdDate: { gte: startDate, lte: endDate } },
          ],
        },
        select: {
          paidValue: true,
          status: true,
          createdDate: true,
          appointmentDate: true,
        },
      }),
      // Buscar expenses filtradas
      prisma.expense.findMany({
        where: expenseWhere,
        orderBy: { date: 'desc' },
      }),
      // Soma total de expenses
      prisma.expense.aggregate({
        where: expenseWhere,
        _sum: {
          value: true,
        },
      }),
      // Ranking por categoria
      prisma.expense.groupBy({
        by: ['category'],
        where: {
          date: { gte: startDate, lte: endDate },
        },
        _sum: {
          value: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            value: 'desc',
          },
        },
      }),
    ]);

    // Calcular métricas principais usando o utilitário
    const totalRevenue = calculateTotalRevenue(appointments, startDate, endDate);
    
    const totalExpenses = Number(expenseSummary._sum.value || 0);
    const totalProfit = totalRevenue - totalExpenses;

    // Formatar ranking de categorias
    const totalExpensesForPercentage = categoryRanking.reduce(
      (acc, item) => acc + Number(item._sum.value || 0),
      0
    );

    const categoryRankingFormatted = categoryRanking.map((item) => {
      const value = Number(item._sum.value || 0);
      return {
        category: item.category,
        totalValue: value,
        count: item._count.id,
        percentage: totalExpensesForPercentage > 0 
          ? (value / totalExpensesForPercentage) * 100 
          : 0,
      };
    });

    // Verificar se precisa gerar série temporal (período > 1 mês)
    const monthsDiff = differenceInMonths(endDate, startDate);
    let timeSeries: any[] = [];

    if (monthsDiff >= 1) {
      // Gerar série temporal por mês
      const months: Date[] = [];
      let currentDate = startOfMonth(startDate);
      const endMonthDate = endOfMonth(endDate);

      while (currentDate <= endMonthDate) {
        months.push(currentDate);
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      }

      // Buscar dados por mês
      const monthlyData = await Promise.all(
        months.map(async (month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);

          const [appointmentData, expenseData] = await Promise.all([
            prisma.appointment.findMany({
              where: {
                OR: [
                  { appointmentDate: { gte: monthStart, lte: monthEnd } },
                  { createdDate: { gte: monthStart, lte: monthEnd } },
                ],
              },
              select: {
                paidValue: true,
                status: true,
                createdDate: true,
                appointmentDate: true,
              },
            }),
            prisma.expense.aggregate({
              where: {
                date: { gte: monthStart, lte: monthEnd },
              },
              _sum: {
                value: true,
              },
            }),
          ]);

          // Calcular revenue usando o utilitário
          const revenue = calculateTotalRevenue(appointmentData, monthStart, monthEnd);
          
          const expenses = Number(expenseData._sum.value || 0);

          return {
            period: format(month, 'MM/yy'),
            revenue,
            expenses,
            profit: revenue - expenses,
          };
        })
      );

      timeSeries = monthlyData;
    }

    // Formatar expenses
    const expensesFormatted = expenses.map((expense) => ({
      id: expense.id,
      payment: expense.payment,
      value: Number(expense.value),
      date: expense.date,
      category: expense.category,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    }));

    // Resposta
    const response = {
      summary: {
        totalRevenue,
        totalExpenses,
        totalProfit,
      },
      categoryRanking: categoryRankingFormatted,
      timeSeries,
      expenses: expensesFormatted,
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

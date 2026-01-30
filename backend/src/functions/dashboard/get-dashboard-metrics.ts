import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { appointmentDAO } from '@/DAO/appointment';
import { patientDAO } from '@/DAO/patient';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, differenceInMonths, format, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Recife';

const querySchema = z.object({
  startDate: z.string().transform((val) => {
    // Criar data local sem conversão de timezone
    const [year, month, day] = val.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    // Normalizar para início do dia no timezone de Recife
    return startOfDay(toZonedTime(localDate, TIMEZONE));
  }),
  endDate: z.string().transform((val) => {
    // Criar data local sem conversão de timezone
    const [year, month, day] = val.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    // Normalizar para final do dia no timezone de Recife
    return endOfDay(toZonedTime(localDate, TIMEZONE));
  }),
});

export const getDashboardMetrics = async (req: any, res: any) => {
  try {
    const { startDate, endDate } = querySchema.parse(req.query);

    // Buscar todas as métricas em paralelo
    const [
      financial,
      paymentStatus,
      patientSegmentation,
    ] = await Promise.all([
      appointmentDAO.getFinancialMetrics(startDate, endDate, {}),
      appointmentDAO.getPaymentStatus(startDate, endDate),
      patientDAO.getPatientSegmentation(startDate, endDate),
    ]);

    // Processar métricas financeiras
    const totalRevenue = Number(financial._sum.examValue || 0);
    const receivedRevenue = Number(financial._sum.paidValue || 0);
    const pendingRevenue = totalRevenue - receivedRevenue;
    const totalAppointments = financial._count.id;
    const averageTicket = Number(financial._avg.examValue || 0);

    const paidCount = paymentStatus.find((p) => p.paymentDone)?._count.id || 0;
    const paymentRate = totalAppointments > 0 ? (paidCount / totalAppointments) * 100 : 0;

    // Processar pacientes - apenas pacientes atendidos no período
    const totalPatients = patientSegmentation.length; // Total de pacientes que tiveram atendimentos no período
    const newPatientsCount = patientSegmentation.filter((p) => p.isNew).length;
    const recurringPatientsCount = patientSegmentation.filter((p) => p.isRecurring).length;

    // Buscar métricas de despesas
    const [expenseSummary, categoryRanking] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          date: { gte: startDate, lte: endDate },
        },
        _sum: {
          value: true,
        },
      }),
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

    const totalExpenses = Number(expenseSummary._sum.value || 0);
    const totalProfit = receivedRevenue - totalExpenses;

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

    // Gerar série temporal (se período > 1 mês)
    const monthsDiff = differenceInMonths(endDate, startDate);
    let timeSeries: any[] = [];

    if (monthsDiff >= 1) {
      const months: Date[] = [];
      let currentDate = startOfMonth(startDate);
      const endMonthDate = endOfMonth(endDate);

      while (currentDate <= endMonthDate) {
        months.push(currentDate);
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      }

      const monthlyData = await Promise.all(
        months.map(async (month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);

          // Garantir que estamos dentro do período selecionado
          const actualStart = monthStart < startDate ? startDate : monthStart;
          const actualEnd = monthEnd > endDate ? endDate : monthEnd;

          const [appointmentData, expenseData] = await Promise.all([
            prisma.appointment.aggregate({
              where: {
                appointmentDate: { gte: actualStart, lte: actualEnd },
              },
              _sum: {
                paidValue: true,
              },
              _count: {
                id: true,
              },
            }),
            prisma.expense.aggregate({
              where: {
                date: { gte: actualStart, lte: actualEnd },
              },
              _sum: {
                value: true,
              },
            }),
          ]);

          const revenue = Number(appointmentData._sum.paidValue || 0);
          const expenses = Number(expenseData._sum.value || 0);
          const appointments = appointmentData._count.id || 0;

          return {
            period: format(month, 'MM/yy'),
            revenue,
            expenses,
            profit: revenue - expenses,
            appointments,
          };
        })
      );

      timeSeries = monthlyData;
    }

    // Montar resposta do dashboard
    const response = {
      financial: {
        totalRevenue,
        receivedRevenue,
        pendingRevenue,
        averageTicket,
        paymentRate,
        totalAppointments,
        totalExpenses,
        totalProfit,
      },
      patients: {
        total: totalPatients,
        newPatients: newPatientsCount,
        recurringPatients: recurringPatientsCount,
      },
      expenses: {
        summary: {
          totalExpenses,
        },
        categoryRanking: categoryRankingFormatted,
        timeSeries,
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

import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { appointmentDAO } from '@/DAO/appointment';

const querySchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  specialtyId: z.string().optional(),
  insuranceName: z.string().optional(),
  groupBy: z.enum(['day', 'month', 'year']).optional().default('month'),
});

export const getAppointmentsMetrics = async (req: any, res: any) => {
  try {
    const { startDate, endDate, doctorId, patientId, specialtyId, insuranceName, groupBy } =
      querySchema.parse(req.query);

    // Construir filtros
    const filters: any = {};
    if (doctorId) filters.doctorId = doctorId;
    if (patientId) filters.patientId = patientId;
    if (specialtyId) filters.specialtyId = specialtyId;
    if (insuranceName) filters.insuranceName = insuranceName;

    // Buscar todas as métricas em paralelo
    const [
      financial,
      paymentStatus,
      byInsurance,
      byDoctor,
      timeSeries,
      todayAppointments,
      weekAppointments,
    ] = await Promise.all([
      appointmentDAO.getFinancialMetrics(startDate, endDate, filters),
      appointmentDAO.getPaymentStatus(startDate, endDate),
      appointmentDAO.getByInsurance(startDate, endDate),
      appointmentDAO.getByDoctor(startDate, endDate),
      appointmentDAO.getTimeSeriesData(startDate, endDate, groupBy),
      appointmentDAO.getTodayAppointments(),
      appointmentDAO.getWeekAppointments(),
    ]);

    // Calcular métricas derivadas
    const totalRevenue = Number(financial._sum.examValue || 0);
    const receivedRevenue = Number(financial._sum.paidValue || 0);
    const pendingRevenue = totalRevenue - receivedRevenue;
    const totalAppointments = financial._count.id;
    const averageTicket = Number(financial._avg.examValue || 0);

    // Calcular taxas de pagamento e inadimplência
    const paidCount = paymentStatus.find((p) => p.paymentDone)?._count.id || 0;
    const unpaidCount = paymentStatus.find((p) => !p.paymentDone)?._count.id || 0;
    const paymentRate = totalAppointments > 0 ? (paidCount / totalAppointments) * 100 : 0;
    const defaultRate = totalAppointments > 0 ? (unpaidCount / totalAppointments) * 100 : 0;

    // Calcular crescimento (comparando com período anterior)
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
    const previousEndDate = new Date(startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);

    const previousFinancial = await appointmentDAO.getFinancialMetrics(
      previousStartDate,
      previousEndDate,
      filters
    );

    const previousRevenue = Number(previousFinancial._sum.examValue || 0);
    const revenueGrowth =
      previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const previousAppointments = previousFinancial._count.id;
    const appointmentsGrowth =
      previousAppointments > 0
        ? ((totalAppointments - previousAppointments) / previousAppointments) * 100
        : 0;

    // Processar dados por convênio
    const byInsuranceData = byInsurance.map((item) => ({
      insuranceName: item.insuranceName || 'Particular',
      totalRevenue: Number(item._sum.examValue || 0),
      receivedRevenue: Number(item._sum.paidValue || 0),
      pendingRevenue: Number(item._sum.examValue || 0) - Number(item._sum.paidValue || 0),
      appointmentCount: item._count.id,
      averageTicket:
        item._count.id > 0 ? Number(item._sum.examValue || 0) / item._count.id : 0,
    }));

    // Processar dados por médico
    const byDoctorData = byDoctor.map((item) => ({
      doctorId: item.doctorId,
      totalRevenue: Number(item._sum.examValue || 0),
      receivedRevenue: Number(item._sum.paidValue || 0),
      appointmentCount: item._count.id,
      averageTicket: Number(item._avg.examValue || 0),
    }));

    // Formatar série temporal
    const timeSeriesFormatted = (timeSeries as any[]).map((item: any) => ({
      period: item.period,
      appointmentCount: item.count,
      revenue: Number(item.revenue || 0),
      received: Number(item.received || 0),
    }));

    // Montar resposta
    const metrics = {
      summary: {
        totalRevenue,
        receivedRevenue,
        pendingRevenue,
        totalAppointments,
        averageTicket,
        paymentRate,
        defaultRate,
        revenueGrowth,
        appointmentsGrowth,
        todayAppointments,
        weekAppointments,
      },
      byInsurance: byInsuranceData,
      byDoctor: byDoctorData,
      timeSeries: timeSeriesFormatted,
      period: {
        startDate,
        endDate,
        days: daysDiff,
      },
    };

    return res.status(200).send({ data: metrics });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

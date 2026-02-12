import { handleErrors } from '@/utils/handle-errors';
import { calculateTotalRevenue, filterAppointmentsForRevenue } from '@/utils/calculate-revenue';
import { z } from 'zod';
import { appointmentDAO } from '@/DAO/appointment';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  startDate: z.string().min(1, 'startDate is required').transform((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid startDate format. Expected ISO date string or YYYY-MM-DD');
    }
    return new Date(date.toISOString().split('T')[0] + 'T00:00:00.000Z');
  }),
  endDate: z.string().min(1, 'endDate is required').transform((val) => {
    const date = new Date(val);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid endDate format. Expected ISO date string or YYYY-MM-DD');
    }
    return new Date(date.toISOString().split('T')[0] + 'T23:59:59.999Z');
  }),
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 100)),
  search: z.string().optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  specialtyId: z.string().optional(),
  insuranceName: z.string().optional(),
});

export const getAppointmentsMetrics = async (req: any, res: any) => {
  try {
    const { startDate, endDate, page, limit, search, doctorId, patientId, specialtyId, insuranceName } =
      querySchema.parse(req.query);

    // Construir filtros para busca de atendimentos
    const where: any = {
      appointmentDate: { gte: startDate, lte: endDate },
    };

    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (specialtyId) where.specialtyId = specialtyId;
    if (insuranceName) where.insuranceName = insuranceName;

    if (search) {
      where.OR = [
        { patient: { fullName: { contains: search, mode: 'insensitive' } } },
        { doctor: { name: { contains: search, mode: 'insensitive' } } },
        { insuranceName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    console.log(startDate, endDate)
    
    // Buscar atendimentos e métricas em paralelo
    const [
      appointments,
      total,
      appointmentsForRevenue,
      todayAppointments,
      byDoctor,
      timeSeries,
    ] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              cpf: true,
              insuranceName: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              crm: true,
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
                  code: true,
                },
              },
            },
          },
        },
        orderBy: { appointmentDate: 'desc' },
        skip,
        take: limit,
      }),
      appointmentDAO.count(where),
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
      appointmentDAO.getTodayAppointments(),
      appointmentDAO.getByDoctor(startDate, endDate),
      appointmentDAO.getTimeSeriesData(startDate, endDate, 'month'),
    ]);

    console.log("app ", appointments.length)

    // Processar dados por médico
    const byDoctorData = await Promise.all(
      byDoctor.map(async (item) => {
        const doctor = await prisma.doctor.findUnique({
          where: { id: item.doctorId },
          select: { id: true, name: true, crm: true },
        });

        return {
          doctorId: item.doctorId,
          name: doctor?.name || 'Desconhecido',
          crm: doctor?.crm,
          appointmentCount: item._count.id,
          totalRevenue: Number(item._sum.paidValue || 0),
          averageTicket: Number(item._avg.examValue || 0),
        };
      })
    );

    // Formatar série temporal
    const timeSeriesFormatted = (timeSeries as any[]).map((item: any) => ({
      period: item.period,
      appointmentCount: item.count,
      revenue: Number(item.revenue || 0),
      received: Number(item.received || 0),
    }));

    // Calcular métricas do período usando o utilitário
    const totalRevenue = calculateTotalRevenue(appointmentsForRevenue, startDate, endDate);
    
    // Filtrar appointments que devem ser incluídos no faturamento
    const appointmentsInRevenue = filterAppointmentsForRevenue(appointmentsForRevenue, startDate, endDate);
    
    const totalAppointmentsPeriod = appointmentsInRevenue.length;
    const averageTicket = totalAppointmentsPeriod > 0 ? totalRevenue / totalAppointmentsPeriod : 0;

    // Resposta
    const response = {
      summary: {
        totalAppointments: totalAppointmentsPeriod, // Total no período selecionado
        totalRevenue,
        averageTicket,
        todayAppointments,
      },
      byDoctor: byDoctorData,
      timeSeries: timeSeriesFormatted,
      appointments: appointments.map((apt) => ({
        id: apt.id,
        externalId: apt.externalId,
        appointmentDate: apt.appointmentDate,
        appointmentTime: apt.appointmentTime,
        appointmentAt: apt.appointmentAt,
        insuranceName: apt.insuranceName,
        status: apt.status,
        examsRaw: apt.examsRaw,
        examValue: apt.examValue ? Number(apt.examValue) : null,
        paidValue: apt.paidValue ? Number(apt.paidValue) : null,
        paymentDone: apt.paymentDone,
        patient: apt.patient,
        doctor: apt.doctor,
        specialty: apt.specialty,
        procedures: apt.appointmentProcedures.map((ap) => ({
          id: ap.procedure.id,
          name: ap.procedure.name,
          code: ap.procedure.code,
          quantity: ap.quantity,
        })),
      })),
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

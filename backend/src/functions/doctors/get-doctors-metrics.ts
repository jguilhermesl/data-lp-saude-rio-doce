import { handleErrors } from '@/utils/handle-errors';
import { calculateTotalRevenue } from '@/utils/calculate-revenue';
import { z } from 'zod';
import { doctorDAO } from '@/DAO/doctor';
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
  search: z.string().optional(),
});

export const getDoctorsMetrics = async (req: any, res: any) => {
  try {
    const { startDate, endDate, search } = querySchema.parse(req.query);

    // Construir filtro de busca por nome
    const whereFilter = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    // Buscar TODOS os médicos (não apenas os que têm atendimentos no período)
    // Filtro: appointmentDate OU createdDate dentro do período
    const allDoctors = await prisma.doctor.findMany({
      where: whereFilter,
      include: {
        appointments: {
          where: {
            OR: [
              { appointmentDate: { gte: startDate, lte: endDate } },
              { createdDate: { gte: startDate, lte: endDate } },
            ],
          },
          select: {
            id: true,
            examValue: true,
            paidValue: true,
            patientId: true,
            appointmentDate: true,
            createdDate: true,
            status: true,
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

    // Processar métricas de cada médico
    const metricsPromises = allDoctors.map(async (doctor) => {
      // Calcular faturamento usando o utilitário
      const totalRevenue = calculateTotalRevenue(doctor.appointments, startDate, endDate);
      const receivedRevenue = calculateTotalRevenue(doctor.appointments, startDate, endDate);
      
      const appointmentCount = doctor.appointments.length;
      const averageTicket = appointmentCount > 0 ? totalRevenue / appointmentCount : 0;

      // Calcular produtividade
      const productivity = await doctorDAO.getDoctorProductivity(doctor.id, startDate, endDate);

      // Obter especialidades
      const specialties = doctor.doctorSpecialties.map((ds) => ({
        id: ds.specialty.id,
        name: ds.specialty.name,
      }));

      // Pacientes únicos
      const uniquePatients = new Set(doctor.appointments.map((apt) => apt.patientId)).size;

      return {
        doctorId: doctor.id,
        name: doctor.name,
        crm: doctor.crm,
        specialties,
        appointmentCount,
        uniquePatients,
        totalRevenue,
        receivedRevenue,
        pendingRevenue: totalRevenue - receivedRevenue,
        averageTicket,
        productivity: {
          appointmentsPerDay: productivity.appointmentsPerDay,
          totalDays: productivity.days,
        },
      };
    });

    let metrics = await Promise.all(metricsPromises);

    // Ordenar por faturamento (decrescente)
    metrics = metrics.sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Filtrar médicos com dados relevantes para cada cálculo do summary
    const doctorsWithRevenue = metrics.filter(m => m.totalRevenue > 0);
    const doctorsWithAppointments = metrics.filter(m => m.appointmentCount > 0);

    // Identificar top performers (apenas entre os que têm dados relevantes)
    const topByRevenue = doctorsWithRevenue.length > 0 ? doctorsWithRevenue[0] : null;
    const topByAppointments = doctorsWithAppointments.length > 0
      ? doctorsWithAppointments.reduce((prev, current) =>
          prev.appointmentCount > current.appointmentCount ? prev : current
        )
      : null;

    // Calcular médias apenas com médicos que têm dados relevantes
    const avgRevenue = doctorsWithRevenue.length > 0
      ? doctorsWithRevenue.reduce((sum, m) => sum + m.totalRevenue, 0) / doctorsWithRevenue.length
      : 0;
    
    const avgAppointments = doctorsWithAppointments.length > 0
      ? doctorsWithAppointments.reduce((sum, m) => sum + m.appointmentCount, 0) / doctorsWithAppointments.length
      : 0;
    
    const avgTicket = doctorsWithAppointments.length > 0
      ? doctorsWithAppointments.reduce((sum, m) => sum + m.averageTicket, 0) / doctorsWithAppointments.length
      : 0;

    // Resposta
    const response = {
      summary: {
        totalDoctors: metrics.length, // Total de TODOS os médicos
        avgRevenue,
        avgAppointments,
        avgTicket,
        topByRevenue: topByRevenue
          ? {
              doctorId: topByRevenue.doctorId,
              name: topByRevenue.name,
              totalRevenue: topByRevenue.totalRevenue,
            }
          : null,
        topByAppointments: topByAppointments
          ? {
              doctorId: topByAppointments.doctorId,
              name: topByAppointments.name,
              appointmentCount: topByAppointments.appointmentCount,
            }
          : null,
      },
      doctors: metrics, // Retorna TODOS os médicos
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

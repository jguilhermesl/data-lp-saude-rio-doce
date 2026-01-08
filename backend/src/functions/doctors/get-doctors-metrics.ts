import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { doctorDAO } from '@/DAO/doctor';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});

export const getDoctorsMetrics = async (req: any, res: any) => {
  try {
    const { startDate, endDate } = querySchema.parse(req.query);

    // Buscar performance de todos os médicos
    const doctorsPerformance = await doctorDAO.getDoctorsPerformance(startDate, endDate);

    // Processar métricas de cada médico
    const metricsPromises = doctorsPerformance.map(async (doctor) => {
      // Calcular faturamento e atendimentos
      const totalRevenue = doctor.appointments.reduce(
        (sum, apt) => sum + Number(apt.examValue || 0),
        0
      );
      const receivedRevenue = doctor.appointments.reduce(
        (sum, apt) => sum + Number(apt.paidValue || 0),
        0
      );
      const appointmentCount = doctor.appointments.length;
      const averageTicket = appointmentCount > 0 ? totalRevenue / appointmentCount : 0;

      // Calcular taxa de retorno
      const returnRate = await doctorDAO.getDoctorReturnRate(doctor.id);

      // Calcular produtividade
      const productivity = await doctorDAO.getDoctorProductivity(doctor.id, startDate, endDate);

      // Obter especialidades
      const specialties = doctor.doctorSpecialties.map((ds) => ({
        id: ds.specialty.id,
        name: ds.specialty.name,
        acronym: ds.specialty.acronym,
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
        returnRate: returnRate.returnRate,
        returningPatientsCount: returnRate.returningPatients,
        newPatientsCount: returnRate.newPatients,
        productivity: {
          appointmentsPerDay: productivity.appointmentsPerDay,
          totalDays: productivity.days,
        },
      };
    });

    let metrics = await Promise.all(metricsPromises);

    // Ordenar por faturamento (decrescente)
    metrics = metrics.sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Identificar top performers
    const topByRevenue = metrics[0];
    const topByReturnRate = metrics.reduce((prev, current) =>
      prev.returnRate > current.returnRate ? prev : current
    );
    const topByAppointments = metrics.reduce((prev, current) =>
      prev.appointmentCount > current.appointmentCount ? prev : current
    );

    // Calcular médias gerais
    const totalDoctors = metrics.length;
    const avgRevenue =
      metrics.reduce((sum, m) => sum + m.totalRevenue, 0) / (totalDoctors || 1);
    const avgAppointments =
      metrics.reduce((sum, m) => sum + m.appointmentCount, 0) / (totalDoctors || 1);
    const avgReturnRate =
      metrics.reduce((sum, m) => sum + m.returnRate, 0) / (totalDoctors || 1);
    const avgTicket = metrics.reduce((sum, m) => sum + m.averageTicket, 0) / (totalDoctors || 1);

    // Resposta
    const response = {
      summary: {
        totalDoctors,
        avgRevenue,
        avgAppointments,
        avgReturnRate,
        avgTicket,
        topByRevenue: topByRevenue
          ? {
              doctorId: topByRevenue.doctorId,
              name: topByRevenue.name,
              totalRevenue: topByRevenue.totalRevenue,
            }
          : null,
        topByReturnRate: topByReturnRate
          ? {
              doctorId: topByReturnRate.doctorId,
              name: topByReturnRate.name,
              returnRate: topByReturnRate.returnRate,
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
      doctors: metrics,
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

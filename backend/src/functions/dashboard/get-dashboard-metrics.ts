import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { appointmentDAO } from '@/DAO/appointment';
import { doctorDAO } from '@/DAO/doctor';
import { patientDAO } from '@/DAO/patient';
import { procedureDAO } from '@/DAO/procedure';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});

export const getDashboardMetrics = async (req: any, res: any) => {
  try {
    const { startDate, endDate } = querySchema.parse(req.query);

    // Buscar todas as métricas em paralelo
    const [
      financial,
      paymentStatus,
      doctorsPerformance,
      topDoctors,
      patientSegmentation,
      returnRate,
      topProcedures,
      totalDoctors,
      totalPatients,
      totalProcedures,
    ] = await Promise.all([
      appointmentDAO.getFinancialMetrics(startDate, endDate, {}),
      appointmentDAO.getPaymentStatus(startDate, endDate),
      doctorDAO.getDoctorsPerformance(startDate, endDate),
      doctorDAO.getTopDoctorsByRevenue(startDate, endDate, 3),
      patientDAO.getPatientSegmentation(startDate, endDate),
      patientDAO.getReturnRate(),
      procedureDAO.getTopSellingProcedures(startDate, endDate, 3),
      doctorDAO.count(),
      patientDAO.count(),
      procedureDAO.count(),
    ]);

    // Processar métricas financeiras
    const totalRevenue = Number(financial._sum.examValue || 0);
    const receivedRevenue = Number(financial._sum.paidValue || 0);
    const pendingRevenue = totalRevenue - receivedRevenue;
    const totalAppointments = financial._count.id;
    const averageTicket = Number(financial._avg.examValue || 0);

    const paidCount = paymentStatus.find((p) => p.paymentDone)?._count.id || 0;
    const unpaidCount = paymentStatus.find((p) => !p.paymentDone)?._count.id || 0;
    const paymentRate = totalAppointments > 0 ? (paidCount / totalAppointments) * 100 : 0;

    // Processar top médicos
    const doctorIds = topDoctors.map((d) => d.doctorId);
    const doctorsDetails = await prisma.doctor.findMany({
      where: { id: { in: doctorIds } },
      select: { id: true, name: true, crm: true },
    });

    const topDoctorsData = topDoctors.map((item) => {
      const doctor = doctorsDetails.find((d) => d.id === item.doctorId);
      return {
        doctorId: item.doctorId,
        name: doctor?.name || 'Desconhecido',
        crm: doctor?.crm,
        totalRevenue: Number(item._sum.examValue || 0),
      };
    });

    // Calcular taxa de retorno de médicos (top 3)
    const topDoctorsWithReturnRate = await Promise.all(
      topDoctorsData.slice(0, 3).map(async (doctor) => {
        const returnRate = await doctorDAO.getDoctorReturnRate(doctor.doctorId);
        return {
          ...doctor,
          returnRate: returnRate.returnRate,
        };
      })
    );

    const bestReturnRateDoctor = topDoctorsWithReturnRate.reduce((prev, current) =>
      prev.returnRate > current.returnRate ? prev : current
    );

    // Processar pacientes
    const newPatientsCount = patientSegmentation.filter((p) => p.isNew).length;
    const recurringPatientsCount = patientSegmentation.filter((p) => p.isRecurring).length;

    // Processar top procedimentos
    const procedureIds = topProcedures.map((p) => p.procedureId);
    const proceduresDetails = await prisma.procedure.findMany({
      where: { id: { in: procedureIds } },
      select: { id: true, name: true, code: true },
    });

    const topProceduresData = topProcedures.map((item) => {
      const procedure = proceduresDetails.find((p) => p.id === item.procedureId);
      return {
        procedureId: item.procedureId,
        name: procedure?.name || 'Desconhecido',
        code: procedure?.code,
        quantitySold: item._sum.quantity || 0,
        timesOrdered: item._count.id,
        totalRevenue: Number(item._sum.totalPrice || 0),
      };
    });

    // Montar resposta do dashboard
    const response = {
      financial: {
        totalRevenue,
        receivedRevenue,
        pendingRevenue,
        averageTicket,
        paymentRate,
        totalAppointments,
      },
      doctors: {
        total: totalDoctors,
        topByRevenue: topDoctorsData,
        bestReturnRate: {
          doctorId: bestReturnRateDoctor.doctorId,
          name: bestReturnRateDoctor.name,
          returnRate: bestReturnRateDoctor.returnRate,
        },
      },
      patients: {
        total: totalPatients,
        newPatients: newPatientsCount,
        recurringPatients: recurringPatientsCount,
        returnRate: returnRate.returnRate,
      },
      procedures: {
        total: totalProcedures,
        topSelling: topProceduresData,
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

import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { patientDAO } from '@/DAO/patient';
import { prisma } from '@/lib/prisma';

const querySchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});

export const getPatientsMetrics = async (req: any, res: any) => {
  try {
    const { startDate, endDate } = querySchema.parse(req.query);

    // Buscar métricas em paralelo
    const [segmentation, ltvData, patientsAtRisk, returnRateData, newPatients] = await Promise.all(
      [
        patientDAO.getPatientSegmentation(startDate, endDate),
        patientDAO.getPatientLTV(20),
        patientDAO.getPatientsAtRisk(3),
        patientDAO.getReturnRate(),
        patientDAO.getNewPatients(startDate, endDate),
      ]
    );

    // Calcular métricas de segmentação
    const totalPatients = segmentation.length;
    const newPatientsCount = segmentation.filter((p) => p.isNew).length;
    const recurringPatientsCount = segmentation.filter((p) => p.isRecurring).length;

    // Calcular LTV médio
    const averageLTV =
      ltvData.length > 0
        ? ltvData.reduce((sum, p) => sum + p.totalSpent, 0) / ltvData.length
        : 0;

    // Top 20 pacientes VIP com nomes
    const vipPatientIds = ltvData.map((ltv) => ltv.patientId);
    const vipPatientsDetails = await prisma.patient.findMany({
      where: {
        id: { in: vipPatientIds },
      },
      select: {
        id: true,
        fullName: true,
        cpf: true,
      },
    });

    const vipPatientsData = ltvData.map((ltv) => {
      const patient = vipPatientsDetails.find((p) => p.id === ltv.patientId);
      return {
        patientId: ltv.patientId,
        fullName: patient?.fullName || 'Desconhecido',
        cpf: patient?.cpf,
        totalSpent: ltv.totalSpent,
        totalPaid: ltv.totalPaid,
        appointmentCount: ltv.appointmentCount,
        lastAppointmentDate: ltv.lastAppointmentDate,
      };
    });

    // Pacientes em risco de churn
    const churnRate = returnRateData.totalPatients > 0 ? (patientsAtRisk.length / returnRateData.totalPatients) * 100 : 0;

    // Taxa de retorno
    const returnRate = returnRateData.returnRate;

    // Distribuição por faixa de LTV
    const ltvRanges = {
      low: segmentation.filter((p) => p.totalSpent < 500).length,
      medium: segmentation.filter((p) => p.totalSpent >= 500 && p.totalSpent < 2000).length,
      high: segmentation.filter((p) => p.totalSpent >= 2000).length,
    };

    // Resposta
    const response = {
      summary: {
        totalPatients,
        newPatients: newPatientsCount,
        recurringPatients: recurringPatientsCount,
        returnRate,
        averageLTV,
        vipPatientsCount: vipPatientsData.length,
        patientsAtRiskCount: patientsAtRisk.length,
        churnRate,
      },
      segmentation: {
        newPatients: newPatientsCount,
        recurringPatients: recurringPatientsCount,
        vipPatients: vipPatientsData.length,
        atRisk: patientsAtRisk.length,
      },
      ltvDistribution: ltvRanges,
      vipPatients: vipPatientsData,
      patientsAtRisk: patientsAtRisk.slice(0, 10), // Top 10 em risco
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

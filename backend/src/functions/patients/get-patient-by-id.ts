import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { patientDAO } from '@/DAO/patient';

const paramsSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const getPatientById = async (req: any, res: any) => {
  try {
    const { id } = paramsSchema.parse(req.params);

    const patient = await patientDAO.findById(id, {
      appointments: {
        include: {
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
              acronym: true,
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
        orderBy: {
          appointmentDate: 'desc',
        },
      },
      _count: {
        select: {
          appointments: true,
        },
      },
    });

    if (!patient) {
      return res.status(404).send({ message: 'Paciente não encontrado' });
    }

    // Calcular métricas do paciente
    const patientData = patient as any;
    const totalSpent = patientData.appointments.reduce(
      (sum: number, apt: any) => sum + Number(apt.examValue || 0),
      0
    );
    const totalPaid = patientData.appointments.reduce(
      (sum: number, apt: any) => sum + Number(apt.paidValue || 0),
      0
    );

    return res.status(200).send({
      data: {
        ...patient,
        metrics: {
          appointmentCount: patientData._count.appointments,
          totalSpent,
          totalPaid,
          pendingAmount: totalSpent - totalPaid,
          averageTicket:
            patientData._count.appointments > 0
              ? totalSpent / patientData._count.appointments
              : 0,
        },
      },
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { doctorDAO } from '@/DAO/doctor';

const paramsSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const getDoctorById = async (req: any, res: any) => {
  try {
    const { id } = paramsSchema.parse(req.params);

    const doctor = await doctorDAO.findById(id, {
      doctorSpecialties: {
        include: {
          specialty: {
            select: {
              id: true,
              name: true,
              acronym: true,
              description: true,
              commissionValue: true,
              commissionType: true,
            },
          },
        },
      },
      appointments: {
        select: {
          id: true,
          appointmentDate: true,
          examValue: true,
          paidValue: true,
          paymentDone: true,
          patient: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          appointmentDate: 'desc',
        },
        take: 10,
      },
      _count: {
        select: {
          appointments: true,
        },
      },
    });

    if (!doctor) {
      return res.status(404).send({ message: 'Médico não encontrado' });
    }

    return res.status(200).send({ data: doctor });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

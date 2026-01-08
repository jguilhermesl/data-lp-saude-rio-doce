import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { specialtyDAO } from '@/DAO/specialty';

const paramsSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const getSpecialtyById = async (req: any, res: any) => {
  try {
    const { id } = paramsSchema.parse(req.params);

    const specialty = await specialtyDAO.findById(id, {
      doctorSpecialties: {
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              crm: true,
            },
          },
        },
      },
      appointments: {
        select: {
          id: true,
          appointmentDate: true,
          examValue: true,
          doctor: {
            select: {
              id: true,
              name: true,
            },
          },
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
          doctorSpecialties: true,
          appointments: true,
        },
      },
    });

    if (!specialty) {
      return res.status(404).send({ message: 'Especialidade não encontrada' });
    }

    return res.status(200).send({ data: specialty });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { procedureDAO } from '@/DAO/procedure';

const paramsSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const getProcedureById = async (req: any, res: any) => {
  try {
    const { id } = paramsSchema.parse(req.params);

    const procedure = await procedureDAO.findById(id, {
      appointmentProcedures: {
        include: {
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
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
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      _count: {
        select: {
          appointmentProcedures: true,
        },
      },
    });

    if (!procedure) {
      return res.status(404).send({ message: 'Procedimento não encontrado' });
    }

    return res.status(200).send({ data: procedure });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

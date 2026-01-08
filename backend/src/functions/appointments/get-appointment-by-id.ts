import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { appointmentDAO } from '@/DAO/appointment';

const paramsSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const getAppointmentById = async (req: any, res: any) => {
  try {
    const { id } = paramsSchema.parse(req.params);

    const appointment = await appointmentDAO.findById(id, {
      patient: {
        select: {
          id: true,
          fullName: true,
          cpf: true,
          identityNumber: true,
          homePhone: true,
          mobilePhone: true,
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
      responsibleUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      appointmentProcedures: {
        include: {
          procedure: {
            select: {
              id: true,
              name: true,
              code: true,
              defaultPrice: true,
            },
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).send({ message: 'Atendimento não encontrado' });
    }

    return res.status(200).send({ data: appointment });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { appointmentDAO } from '@/DAO/appointment';

const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  specialtyId: z.string().optional(),
  insuranceName: z.string().optional(),
  paymentDone: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
});

export const getAllAppointments = async (req: any, res: any) => {
  try {
    const {
      page,
      limit,
      doctorId,
      patientId,
      specialtyId,
      insuranceName,
      paymentDone,
      startDate,
      endDate,
    } = querySchema.parse(req.query);

    // Construir filtros
    const where: any = {};
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (specialtyId) where.specialtyId = specialtyId;
    if (insuranceName) where.insuranceName = insuranceName;
    if (paymentDone !== undefined) where.paymentDone = paymentDone;

    if (startDate || endDate) {
      where.appointmentDate = {};
      if (startDate) where.appointmentDate.gte = startDate;
      if (endDate) where.appointmentDate.lte = endDate;
    }

    const skip = (page - 1) * limit;

    // Buscar atendimentos com paginação
    const [appointments, total] = await Promise.all([
      appointmentDAO.findMany(
        where,
        {
          patient: {
            select: {
              id: true,
              fullName: true,
              cpf: true,
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
        { appointmentDate: 'desc' },
        skip,
        limit
      ),
      appointmentDAO.count(where),
    ]);

    return res.status(200).send({
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

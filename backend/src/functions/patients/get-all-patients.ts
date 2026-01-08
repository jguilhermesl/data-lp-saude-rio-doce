import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { patientDAO } from '@/DAO/patient';

const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
});

export const getAllPatients = async (req: any, res: any) => {
  try {
    const { page, limit, search } = querySchema.parse(req.query);

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } },
        { mobilePhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Buscar pacientes com paginação
    const [patients, total] = await Promise.all([
      patientDAO.findMany(
        where,
        {
          _count: {
            select: {
              appointments: true,
            },
          },
          appointments: {
            select: {
              appointmentDate: true,
              examValue: true,
            },
            orderBy: {
              appointmentDate: 'desc',
            },
            take: 1,
          },
        },
        { fullName: 'asc' },
        skip,
        limit
      ),
      patientDAO.count(where),
    ]);

    // Enriquecer dados com métricas básicas
    const enrichedPatients = patients.map((patient: any) => {
      const lastAppointment = patient.appointments[0];
      return {
        ...patient,
        appointmentCount: patient._count.appointments,
        lastAppointmentDate: lastAppointment?.appointmentDate,
        isNew: patient._count.appointments === 1,
        isRecurring: patient._count.appointments > 1,
      };
    });

    return res.status(200).send({
      data: enrichedPatients,
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

import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { doctorDAO } from '@/DAO/doctor';

const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  specialtyId: z.string().optional(),
  search: z.string().optional(),
});

export const getAllDoctors = async (req: any, res: any) => {
  try {
    const { page, limit, specialtyId, search } = querySchema.parse(req.query);

    // Construir filtros
    const where: any = {};

    if (specialtyId) {
      where.doctorSpecialties = {
        some: {
          specialtyId,
        },
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { crm: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Buscar médicos com paginação
    const [doctors, total] = await Promise.all([
      doctorDAO.findMany(
        where,
        {
          doctorSpecialties: {
            include: {
              specialty: {
                select: {
                  id: true,
                  name: true
                },
              },
            },
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
        { name: 'asc' },
        skip,
        limit
      ),
      doctorDAO.count(where),
    ]);

    return res.status(200).send({
      data: doctors,
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

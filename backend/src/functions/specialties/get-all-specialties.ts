import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { specialtyDAO } from '@/DAO/specialty';

const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
});

export const getAllSpecialties = async (req: any, res: any) => {
  try {
    const { page, limit, search } = querySchema.parse(req.query);

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Buscar especialidades com paginação
    const [specialties, total] = await Promise.all([
      specialtyDAO.findMany(
        where,
        {
          _count: {
            select: {
              doctorSpecialties: true,
              appointments: true,
            },
          },
        },
        { name: 'asc' },
        skip,
        limit
      ),
      specialtyDAO.count(where),
    ]);

    return res.status(200).send({
      data: specialties,
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

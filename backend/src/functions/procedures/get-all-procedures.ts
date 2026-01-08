import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { procedureDAO } from '@/DAO/procedure';

const querySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
});

export const getAllProcedures = async (req: any, res: any) => {
  try {
    const { page, limit, search } = querySchema.parse(req.query);

    // Construir filtros
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    // Buscar procedimentos com paginação
    const [procedures, total] = await Promise.all([
      procedureDAO.findMany(
        where,
        {
          _count: {
            select: {
              appointmentProcedures: true,
            },
          },
        },
        { name: 'asc' },
        skip,
        limit
      ),
      procedureDAO.count(where),
    ]);

    return res.status(200).send({
      data: procedures,
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

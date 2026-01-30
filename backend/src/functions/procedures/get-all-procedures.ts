import { prisma } from '@/lib/prisma';
import { handleErrors } from '@/utils/handle-errors';

/**
 * GET /api/procedures
 * Retorna lista simplificada de todos os procedimentos (para filtros)
 */
export async function getAllProcedures(req: any, res: any) {
  try {
    const procedures = await prisma.procedure.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({
      data: procedures,
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
}

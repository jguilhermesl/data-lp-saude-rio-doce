import { prisma } from '@/lib/prisma';
import { handleErrors } from '@/utils/handle-errors';

/**
 * GET /api/doctors
 * Retorna lista simplificada de todos os médicos (para filtros)
 */
export async function getAllDoctors(req: any, res: any) {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
        crm: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.status(200).json({
      data: doctors,
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
}

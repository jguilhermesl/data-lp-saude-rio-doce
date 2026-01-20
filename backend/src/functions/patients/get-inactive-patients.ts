import { patientDAO } from '@/DAO/patient';
import { handleErrors } from '@/utils/handle-errors';

/**
 * GET /api/patients/inactive
 * Retorna lista de pacientes inativos (sem atendimento há X meses)
 */
export async function getInactivePatients(req: any, res: any) {
  try {
    // Parâmetro opcional: quantos meses sem atendimento (padrão: 3)
    const months = req.query.months ? parseInt(req.query.months as string) : 3;

    if (isNaN(months) || months < 1) {
      return res.status(400).json({
        error: 'Parâmetro "months" deve ser um número maior que 0',
      });
    }

    // Buscar pacientes inativos
    const inactivePatients = await patientDAO.getPatientsAtRisk(months);

    // Retornar dados
    return res.status(200).json({
      data: {
        inactivePatients,
        totalInactive: inactivePatients.length,
        monthsThreshold: months,
      },
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
}

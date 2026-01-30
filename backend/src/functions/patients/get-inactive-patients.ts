import { patientDAO } from '@/DAO/patient';
import { handleErrors } from '@/utils/handle-errors';

/**
 * GET /api/patients/inactive
 * Retorna lista de pacientes inativos (sem atendimento há X meses)
 * Query params opcionais:
 * - months: número de meses sem atendimento (padrão: 3)
 * - doctorId: filtrar por médico do último atendimento
 * - procedureId: filtrar por procedimento do último atendimento
 */
export async function getInactivePatients(req: any, res: any) {
  try {
    // Parâmetro opcional: quantos meses sem atendimento (padrão: 3)
    const months = req.query.months ? parseInt(req.query.months as string) : 3;
    const doctorId = req.query.doctorId as string | undefined;
    const procedureId = req.query.procedureId as string | undefined;

    if (isNaN(months) || months < 1) {
      return res.status(400).json({
        error: 'Parâmetro "months" deve ser um número maior que 0',
      });
    }

    // Buscar pacientes inativos com filtros opcionais
    const inactivePatients = await patientDAO.getPatientsAtRisk(
      months,
      doctorId,
      procedureId
    );

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

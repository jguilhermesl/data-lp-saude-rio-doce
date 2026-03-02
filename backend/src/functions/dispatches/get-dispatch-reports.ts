import { Request, Response } from 'express';
import { CadenceType } from '@prisma/client';
import { dispatchService } from '@/services/dispatch.service';
import { handleErrors } from '@/utils/handle-errors';

/**
 * GET /api/dispatches/reports
 * Retorna relatórios de disparos
 * Query params:
 * - startDate: data inicial (ISO string)
 * - endDate: data final (ISO string)
 * - cadence: THIRTY_DAYS | SIXTY_DAYS | NINETY_DAYS
 */
export async function getDispatchReports(req: Request, res: Response) {
  try {
    const { startDate, endDate, cadence } = req.query;

    const filters: any = {};

    if (startDate) {
      filters.startDate = new Date(startDate as string);
    }

    if (endDate) {
      filters.endDate = new Date(endDate as string);
    }

    if (cadence) {
      filters.cadence = cadence as CadenceType;
    }

    const reports = await dispatchService.getReports(filters);

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    console.error('Error in getDispatchReports:', errorMessage);
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}

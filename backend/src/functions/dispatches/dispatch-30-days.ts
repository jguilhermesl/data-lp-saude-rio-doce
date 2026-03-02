import { Request, Response } from 'express';
import { CadenceType } from '@prisma/client';
import { dispatchService } from '@/services/dispatch.service';
import { handleErrors } from '@/utils/handle-errors';

/**
 * POST /api/dispatches/30-days
 * Dispara mensagens para pacientes inativos há 30 dias
 */
export async function dispatch30Days(req: Request, res: Response) {
  try {
    console.log('\n📢 Dispatch 30 days triggered');

    const result = await dispatchService.executeDispatch({
      cadence: CadenceType.THIRTY_DAYS,
      days: 30,
      maxPatients: 30,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    console.error('Error in dispatch30Days:', errorMessage);
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}

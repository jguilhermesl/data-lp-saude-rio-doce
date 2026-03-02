import { Request, Response } from 'express';
import { CadenceType } from '@prisma/client';
import { dispatchService } from '@/services/dispatch.service';
import { handleErrors } from '@/utils/handle-errors';

/**
 * POST /api/dispatches/90-days
 * Dispara mensagens para pacientes inativos há 90 dias
 */
export async function dispatch90Days(req: Request, res: Response) {
  try {
    console.log('\n📢 Dispatch 90 days triggered');

    const result = await dispatchService.executeDispatch({
      cadence: CadenceType.NINETY_DAYS,
      days: 90,
      maxPatients: 30,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    console.error('Error in dispatch90Days:', errorMessage);
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}

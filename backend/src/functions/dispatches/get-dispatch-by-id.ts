import { Request, Response } from 'express';
import { dispatchService } from '@/services/dispatch.service';
import { handleErrors } from '@/utils/handle-errors';

/**
 * GET /api/dispatches/:id
 * Retorna detalhes de um disparo específico
 */
export async function getDispatchById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do disparo é obrigatório',
      });
    }

    const dispatch = await dispatchService.getDispatchById(id);

    return res.status(200).json({
      success: true,
      data: dispatch,
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    console.error('Error in getDispatchById:', errorMessage);
    
    if (errorMessage.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        message: errorMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}

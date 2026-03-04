import { Request, Response } from 'express';
import { dispatchDAO } from '@/DAO/dispatch';
import { handleErrors } from '@/utils/handle-errors';

/**
 * GET /api/dispatches/items/:itemId/notes
 * Retorna todas as notas de um item de disparo
 */
export async function getNotes(req: Request, res: Response) {
  try {
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'ID do item é obrigatório',
      });
    }

    const notes = await dispatchDAO.getNotesByItemId(itemId);

    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    console.error('Error in getNotes:', errorMessage);

    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}

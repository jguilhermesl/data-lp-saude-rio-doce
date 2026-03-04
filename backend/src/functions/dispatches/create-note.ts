import { Request, Response } from 'express';
import { dispatchDAO } from '@/DAO/dispatch';
import { handleErrors } from '@/utils/handle-errors';

/**
 * POST /api/dispatches/items/:itemId/notes
 * Cria uma nota para um item de disparo
 */
export async function createNote(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const { note } = req.body;
    const userId = req.userState?.sub; // Vem do middleware de autenticação

    if (!itemId || !note) {
      return res.status(400).json({
        success: false,
        message: 'ID do item e nota são obrigatórios',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const createdNote = await dispatchDAO.createNote({
      dispatchItemId: itemId,
      userId,
      note,
    });

    return res.status(201).json({
      success: true,
      data: createdNote,
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    console.error('Error in createNote:', errorMessage);

    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}

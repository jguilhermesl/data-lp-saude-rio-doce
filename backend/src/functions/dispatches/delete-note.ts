import { Request, Response } from 'express';
import { dispatchDAO } from '@/DAO/dispatch';
import { handleErrors } from '@/utils/handle-errors';

/**
 * DELETE /api/dispatches/notes/:noteId
 * Deleta uma nota
 */
export async function deleteNote(req: Request, res: Response) {
  try {
    const { noteId } = req.params;

    if (!noteId) {
      return res.status(400).json({
        success: false,
        message: 'ID da nota é obrigatório',
      });
    }

    await dispatchDAO.deleteNote(noteId);

    return res.status(200).json({
      success: true,
      message: 'Nota deletada com sucesso',
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    console.error('Error in deleteNote:', errorMessage);

    if (errorMessage.includes('não encontrado') || errorMessage.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Nota não encontrada',
      });
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}

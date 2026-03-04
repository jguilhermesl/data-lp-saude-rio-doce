import { Request, Response } from 'express';
import { dispatchDAO } from '@/DAO/dispatch';
import { handleErrors } from '@/utils/handle-errors';

/**
 * PATCH /api/dispatches/items/:itemId/lead-status
 * Atualiza o status de resposta do lead de um item de disparo
 */
export async function updateItemLeadStatus(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const { leadStatus } = req.body;

    // Validações
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'ID do item é obrigatório',
      });
    }

    if (!leadStatus) {
      return res.status(400).json({
        success: false,
        message: 'Status do lead é obrigatório',
      });
    }

    // Valida se o valor é válido
    const validStatuses = [
      'NO_RESPONSE',
      'RESPONDED',
      'INTERESTED',
      'NOT_INTERESTED',
      'SCHEDULED',
    ];
    
    if (!validStatuses.includes(leadStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Status do lead inválido. Use: NO_RESPONSE, RESPONDED, INTERESTED, NOT_INTERESTED ou SCHEDULED',
      });
    }

    // Atualiza o item
    const updatedItem = await dispatchDAO.updateItemLeadStatus(
      itemId,
      leadStatus
    );

    return res.status(200).json({
      success: true,
      message: 'Status do lead atualizado com sucesso',
      data: updatedItem,
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    console.error('Error in updateItemLeadStatus:', errorMessage);
    
    if (errorMessage.includes('não encontrado') || errorMessage.includes('Record to update not found')) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}

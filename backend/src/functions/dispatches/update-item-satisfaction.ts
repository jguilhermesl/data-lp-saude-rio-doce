import { Request, Response } from 'express';
import { dispatchDAO } from '@/DAO/dispatch';
import { handleErrors } from '@/utils/handle-errors';
import { SatisfactionLevel } from '@prisma/client';

/**
 * PATCH /api/dispatches/items/:itemId/satisfaction
 * Atualiza o nível de satisfação de um item de disparo
 */
export async function updateItemSatisfaction(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const { satisfactionLevel } = req.body;

    // Validações
    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'ID do item é obrigatório',
      });
    }

    if (!satisfactionLevel) {
      return res.status(400).json({
        success: false,
        message: 'Nível de satisfação é obrigatório',
      });
    }

    // Valida se o valor é válido
    const validLevels: SatisfactionLevel[] = ['NEUTRAL', 'SATISFIED', 'UNSATISFIED'];
    if (!validLevels.includes(satisfactionLevel as SatisfactionLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Nível de satisfação inválido. Use: NEUTRAL, SATISFIED ou UNSATISFIED',
      });
    }

    // Atualiza o item
    const updatedItem = await dispatchDAO.updateItemSatisfaction(
      itemId,
      satisfactionLevel as SatisfactionLevel
    );

    return res.status(200).json({
      success: true,
      message: 'Nível de satisfação atualizado com sucesso',
      data: updatedItem,
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    console.error('Error in updateItemSatisfaction:', errorMessage);
    
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

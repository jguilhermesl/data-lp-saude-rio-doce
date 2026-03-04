import { prisma } from '../lib/prisma';
import { Prisma, MessageDispatch, MessageDispatchItem, CadenceType, DispatchStatus, MessageStatus, SatisfactionLevel } from '@prisma/client';

/**
 * DispatchDAO - Data Access Object para operações relacionadas a disparos de mensagens
 */
export class DispatchDAO {
  // ========== CRUD BÁSICO - MESSAGE DISPATCH ==========

  /**
   * Cria um novo disparo
   */
  async createDispatch(
    data: Prisma.MessageDispatchCreateInput
  ): Promise<MessageDispatch> {
    try {
      return await prisma.messageDispatch.create({ data });
    } catch (error) {
      console.error('Error in DispatchDAO.createDispatch:', error);
      throw error;
    }
  }

  /**
   * Busca um disparo por ID
   */
  async findDispatchById(
    id: string,
    include?: Prisma.MessageDispatchInclude
  ): Promise<MessageDispatch | null> {
    try {
      return await prisma.messageDispatch.findUnique({
        where: { id },
        include,
      });
    } catch (error) {
      console.error('Error in DispatchDAO.findDispatchById:', error);
      throw error;
    }
  }

  /**
   * Busca múltiplos disparos
   */
  async findManyDispatches(
    where?: Prisma.MessageDispatchWhereInput,
    include?: Prisma.MessageDispatchInclude,
    orderBy?: Prisma.MessageDispatchOrderByWithRelationInput
  ): Promise<MessageDispatch[]> {
    try {
      return await prisma.messageDispatch.findMany({
        where,
        include,
        orderBy,
      });
    } catch (error) {
      console.error('Error in DispatchDAO.findManyDispatches:', error);
      throw error;
    }
  }

  /**
   * Atualiza um disparo
   */
  async updateDispatch(
    id: string,
    data: Prisma.MessageDispatchUpdateInput
  ): Promise<MessageDispatch> {
    try {
      return await prisma.messageDispatch.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error in DispatchDAO.updateDispatch:', error);
      throw error;
    }
  }

  // ========== CRUD BÁSICO - MESSAGE DISPATCH ITEM ==========

  /**
   * Cria múltiplos items de disparo
   */
  async createManyItems(
    items: Prisma.MessageDispatchItemCreateManyInput[]
  ): Promise<number> {
    try {
      const result = await prisma.messageDispatchItem.createMany({
        data: items,
      });
      return result.count;
    } catch (error) {
      console.error('Error in DispatchDAO.createManyItems:', error);
      throw error;
    }
  }

  /**
   * Busca items de um disparo
   */
  async findDispatchItems(
    dispatchId: string,
    include?: Prisma.MessageDispatchItemInclude
  ): Promise<MessageDispatchItem[]> {
    try {
      return await prisma.messageDispatchItem.findMany({
        where: { dispatchId },
        include,
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      console.error('Error in DispatchDAO.findDispatchItems:', error);
      throw error;
    }
  }

  /**
   * Atualiza um item de disparo
   */
  async updateItem(
    id: string,
    data: Prisma.MessageDispatchItemUpdateInput
  ): Promise<MessageDispatchItem> {
    try {
      return await prisma.messageDispatchItem.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error in DispatchDAO.updateItem:', error);
      throw error;
    }
  }

  // ========== MÉTODOS PARA RELATÓRIOS ==========

  /**
   * Busca relatórios por período e cadência
   */
  async getReports(filters: {
    startDate?: Date;
    endDate?: Date;
    cadence?: CadenceType;
    status?: DispatchStatus;
  }) {
    try {
      const where: Prisma.MessageDispatchWhereInput = {};

      if (filters.startDate || filters.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = filters.startDate;
        if (filters.endDate) where.date.lte = filters.endDate;
      }

      if (filters.cadence) {
        where.cadence = filters.cadence;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      const dispatches = await prisma.messageDispatch.findMany({
        where,
        include: {
          _count: {
            select: { items: true },
          },
          items: {
            select: {
              status: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      });

      // Recalcula os contadores baseado nos status atuais dos items
      return dispatches.map(dispatch => {
        const successCount = dispatch.items.filter(
          item => item.status === MessageStatus.SENT || 
                  item.status === MessageStatus.DELIVERED || 
                  item.status === MessageStatus.READ
        ).length;

        const errorCount = dispatch.items.filter(
          item => item.status === MessageStatus.FAILED
        ).length;

        return {
          ...dispatch,
          successCount,
          errorCount,
        };
      });
    } catch (error) {
      console.error('Error in DispatchDAO.getReports:', error);
      throw error;
    }
  }

  /**
   * Verifica se já existe disparo para cadência e data
   */
  async findExistingDispatch(
    cadence: CadenceType,
    date: Date
  ): Promise<MessageDispatch | null> {
    try {
      return await prisma.messageDispatch.findFirst({
        where: {
          cadence,
          date,
          status: {
            in: [DispatchStatus.PENDING, DispatchStatus.IN_PROGRESS],
          },
        },
      });
    } catch (error) {
      console.error('Error in DispatchDAO.findExistingDispatch:', error);
      throw error;
    }
  }

  /**
   * Atualiza contadores do disparo
   */
  async updateCounters(id: string) {
    try {
      const items = await prisma.messageDispatchItem.findMany({
        where: { dispatchId: id },
        select: { status: true },
      });

      const successCount = items.filter(
        (item) => item.status === MessageStatus.SENT || item.status === MessageStatus.DELIVERED || item.status === MessageStatus.READ
      ).length;

      const errorCount = items.filter(
        (item) => item.status === MessageStatus.FAILED
      ).length;

      return await this.updateDispatch(id, {
        successCount,
        errorCount,
      });
    } catch (error) {
      console.error('Error in DispatchDAO.updateCounters:', error);
      throw error;
    }
  }

  /**
   * Busca items pendentes de um disparo
   */
  async findPendingItems(dispatchId: string): Promise<MessageDispatchItem[]> {
    try {
      return await prisma.messageDispatchItem.findMany({
        where: {
          dispatchId,
          status: MessageStatus.PENDING,
        },
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              mobilePhone: true,
              homePhone: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      console.error('Error in DispatchDAO.findPendingItems:', error);
      throw error;
    }
  }

  /**
   * Atualiza o nível de satisfação de um item de disparo
   */
  async updateItemSatisfaction(
    itemId: string,
    satisfactionLevel: SatisfactionLevel
  ): Promise<MessageDispatchItem> {
    try {
      return await prisma.messageDispatchItem.update({
        where: { id: itemId },
        data: { satisfactionLevel },
      });
    } catch (error) {
      console.error('Error in DispatchDAO.updateItemSatisfaction:', error);
      throw error;
    }
  }

  /**
   * Atualiza o status de resposta do lead de um item de disparo
   */
  async updateItemLeadStatus(
    itemId: string,
    leadStatus: string
  ): Promise<MessageDispatchItem> {
    try {
      return await prisma.messageDispatchItem.update({
        where: { id: itemId },
        data: { leadStatus: leadStatus as any },
      });
    } catch (error) {
      console.error('Error in DispatchDAO.updateItemLeadStatus:', error);
      throw error;
    }
  }

  /**
   * Cria uma nota para um item de disparo
   */
  async createNote(data: {
    dispatchItemId: string;
    userId: string;
    note: string;
  }) {
    try {
      return await prisma.dispatchItemNote.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error in DispatchDAO.createNote:', error);
      throw error;
    }
  }

  /**
   * Busca todas as notas de um item de disparo
   */
  async getNotesByItemId(dispatchItemId: string) {
    try {
      return await prisma.dispatchItemNote.findMany({
        where: { dispatchItemId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error in DispatchDAO.getNotesByItemId:', error);
      throw error;
    }
  }

  /**
   * Deleta uma nota
   */
  async deleteNote(noteId: string) {
    try {
      return await prisma.dispatchItemNote.delete({
        where: { id: noteId },
      });
    } catch (error) {
      console.error('Error in DispatchDAO.deleteNote:', error);
      throw error;
    }
  }
}

export const dispatchDAO = new DispatchDAO();

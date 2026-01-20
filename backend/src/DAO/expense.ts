import { prisma } from '../lib/prisma';
import { Prisma, Expense } from '@prisma/client';

/**
 * ExpenseDAO - Data Access Object para operações relacionadas a despesas
 * 
 * Fornece métodos para interagir com a tabela de despesas no banco de dados
 */
export class ExpenseDAO {
  /**
   * Busca uma única despesa que corresponda aos critérios fornecidos
   * 
   * @param where - Filtros para busca
   * @returns Despesa encontrada ou null
   */
  async findOne(
    where: Prisma.ExpenseWhereInput
  ): Promise<Expense | null> {
    try {
      const expense = await prisma.expense.findFirst({
        where,
      });
      return expense;
    } catch (error) {
      console.error('Error in ExpenseDAO.findOne:', error);
      throw error;
    }
  }

  /**
   * Busca múltiplas despesas que correspondam aos critérios fornecidos
   * 
   * @param where - Filtros para busca (opcional)
   * @param orderBy - Ordenação dos resultados (opcional)
   * @param skip - Número de registros a pular (paginação) (opcional)
   * @param take - Número máximo de registros a retornar (paginação) (opcional)
   * @returns Array de despesas encontradas
   */
  async findMany(
    where?: Prisma.ExpenseWhereInput,
    orderBy?: Prisma.ExpenseOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<Expense[]> {
    try {
      const expenses = await prisma.expense.findMany({
        where,
        orderBy,
        skip,
        take,
      });
      return expenses;
    } catch (error) {
      console.error('Error in ExpenseDAO.findMany:', error);
      throw error;
    }
  }

  /**
   * Cria uma única despesa no banco de dados
   * 
   * @param data - Dados para criação da despesa
   * @returns Despesa criada
   */
  async createOne(
    data: Prisma.ExpenseCreateInput
  ): Promise<Expense> {
    try {
      const expense = await prisma.expense.create({
        data,
      });
      return expense;
    } catch (error) {
      console.error('Error in ExpenseDAO.createOne:', error);
      throw error;
    }
  }

  /**
   * Cria múltiplas despesas no banco de dados
   * 
   * @param data - Array de dados para criação das despesas
   * @returns Objeto com contagem de despesas criadas
   */
  async createMany(data: Prisma.ExpenseCreateManyInput[]): Promise<Prisma.BatchPayload> {
    try {
      const result = await prisma.expense.createMany({
        data,
        skipDuplicates: true,
      });
      return result;
    } catch (error) {
      console.error('Error in ExpenseDAO.createMany:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma única despesa que corresponda aos critérios fornecidos
   * 
   * @param where - Filtros para encontrar a despesa
   * @param data - Dados para atualização
   * @returns Despesa atualizada
   */
  async updateOne(
    where: Prisma.ExpenseWhereUniqueInput,
    data: Prisma.ExpenseUpdateInput
  ): Promise<Expense> {
    try {
      const expense = await prisma.expense.update({
        where,
        data,
      });
      return expense;
    } catch (error) {
      console.error('Error in ExpenseDAO.updateOne:', error);
      throw error;
    }
  }

  /**
   * Atualiza múltiplas despesas que correspondam aos critérios fornecidos
   * 
   * @param where - Filtros para encontrar as despesas
   * @param data - Dados para atualização
   * @returns Objeto com contagem de despesas atualizadas
   */
  async updateMany(
    where: Prisma.ExpenseWhereInput,
    data: Prisma.ExpenseUpdateManyMutationInput
  ): Promise<Prisma.BatchPayload> {
    try {
      const result = await prisma.expense.updateMany({
        where,
        data,
      });
      return result;
    } catch (error) {
      console.error('Error in ExpenseDAO.updateMany:', error);
      throw error;
    }
  }

  /**
   * Deleta uma única despesa que corresponda aos critérios fornecidos
   * 
   * @param where - Filtros para encontrar a despesa
   * @returns Despesa deletada
   */
  async deleteOne(where: Prisma.ExpenseWhereUniqueInput): Promise<Expense> {
    try {
      const expense = await prisma.expense.delete({
        where,
      });
      return expense;
    } catch (error) {
      console.error('Error in ExpenseDAO.deleteOne:', error);
      throw error;
    }
  }

  /**
   * Deleta múltiplas despesas que correspondam aos critérios fornecidos
   * 
   * @param where - Filtros para encontrar as despesas
   * @returns Objeto com contagem de despesas deletadas
   */
  async deleteMany(where: Prisma.ExpenseWhereInput): Promise<Prisma.BatchPayload> {
    try {
      const result = await prisma.expense.deleteMany({
        where,
      });
      return result;
    } catch (error) {
      console.error('Error in ExpenseDAO.deleteMany:', error);
      throw error;
    }
  }

  /**
   * Métodos auxiliares adicionais
   */

  /**
   * Busca uma despesa por ID
   * 
   * @param id - ID da despesa
   * @returns Despesa encontrada ou null
   */
  async findById(id: string): Promise<Expense | null> {
    return this.findOne({ id });
  }

  /**
   * Conta o número de despesas que correspondam aos critérios fornecidos
   * 
   * @param where - Filtros para contagem (opcional)
   * @returns Número de despesas
   */
  async count(where?: Prisma.ExpenseWhereInput): Promise<number> {
    try {
      const count = await prisma.expense.count({
        where,
      });
      return count;
    } catch (error) {
      console.error('Error in ExpenseDAO.count:', error);
      throw error;
    }
  }
}

// Exporta uma instância do DAO para uso em toda a aplicação
export const expenseDAO = new ExpenseDAO();

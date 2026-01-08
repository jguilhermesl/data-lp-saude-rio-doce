import { prisma } from '../lib/prisma';
import { Prisma, User } from '@prisma/client';

/**
 * UserDAO - Data Access Object para operações relacionadas a usuários
 * 
 * Fornece métodos para interagir com a tabela de usuários no banco de dados
 */
export class UserDAO {
  /**
   * Busca um único usuário que corresponda aos critérios fornecidos
   * 
   * @param where - Filtros para busca
   * @param include - Relações a incluir (opcional)
   * @returns Usuário encontrado ou null
   * 
   * @example
   * ```typescript
   * const user = await userDAO.findOne({ id: '123' });
   * const userWithOrders = await userDAO.findOne(
   *   { email: 'user@example.com' },
   *   { ordersCreated: true, ordersAsUser: true }
   * );
   * ```
   */
  async findOne(
    where: Prisma.UserWhereInput,
    include?: Prisma.UserInclude
  ): Promise<User | null> {
    try {
      const user = await prisma.user.findFirst({
        where,
        include,
      });
      return user;
    } catch (error) {
      console.error('Error in UserDAO.findOne:', error);
      throw error;
    }
  }

  /**
   * Busca múltiplos usuários que correspondam aos critérios fornecidos
   * 
   * @param where - Filtros para busca (opcional)
   * @param include - Relações a incluir (opcional)
   * @param orderBy - Ordenação dos resultados (opcional)
   * @param skip - Número de registros a pular (paginação) (opcional)
   * @param take - Número máximo de registros a retornar (paginação) (opcional)
   * @returns Array de usuários encontrados
   * 
   * @example
   * ```typescript
   * const clients = await userDAO.findMany({ role: 'client' });
   * const recentUsers = await userDAO.findMany(
   *   { isPremium: true },
   *   undefined,
   *   { createdAt: 'desc' },
   *   0,
   *   10
   * );
   * ```
   */
  async findMany(
    where?: Prisma.UserWhereInput,
    include?: Prisma.UserInclude,
    orderBy?: Prisma.UserOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where,
        include,
        orderBy,
        skip,
        take,
      });
      return users;
    } catch (error) {
      console.error('Error in UserDAO.findMany:', error);
      throw error;
    }
  }

  /**
   * Cria um único usuário no banco de dados
   * 
   * @param data - Dados para criação do usuário
   * @param include - Relações a incluir no retorno (opcional)
   * @returns Usuário criado
   * 
   * @example
   * ```typescript
   * const newUser = await userDAO.createOne({
   *   name: 'João Silva',
   *   phone: '11999999999',
   *   email: 'joao@example.com',
   *   passwordHash: 'hash...',
   *   role: 'client'
   * });
   * ```
   */
  async createOne(
    data: Prisma.UserCreateInput,
    include?: Prisma.UserInclude
  ): Promise<User> {
    try {
      const user = await prisma.user.create({
        data,
        include,
      });
      return user;
    } catch (error) {
      console.error('Error in UserDAO.createOne:', error);
      throw error;
    }
  }

  /**
   * Cria múltiplos usuários no banco de dados
   * 
   * @param data - Array de dados para criação dos usuários
   * @returns Objeto com contagem de usuários criados
   * 
   * @example
   * ```typescript
   * const result = await userDAO.createMany([
   *   { name: 'User 1', phone: '11999999999', passwordHash: 'hash1', role: 'client' },
   *   { name: 'User 2', phone: '11888888888', passwordHash: 'hash2', role: 'client' }
   * ]);
   * console.log(`${result.count} usuários criados`);
   * ```
   */
  async createMany(data: Prisma.UserCreateManyInput[]): Promise<Prisma.BatchPayload> {
    try {
      const result = await prisma.user.createMany({
        data,
        skipDuplicates: true,
      });
      return result;
    } catch (error) {
      console.error('Error in UserDAO.createMany:', error);
      throw error;
    }
  }

  /**
   * Atualiza um único usuário que corresponda aos critérios fornecidos
   * 
   * @param where - Filtros para encontrar o usuário
   * @param data - Dados para atualização
   * @param include - Relações a incluir no retorno (opcional)
   * @returns Usuário atualizado
   * 
   * @example
   * ```typescript
   * const updatedUser = await userDAO.updateOne(
   *   { id: '123' },
   *   { isPremium: true, console: 'PS5' }
   * );
   * ```
   */
  async updateOne(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
    include?: Prisma.UserInclude
  ): Promise<User> {
    try {
      const user = await prisma.user.update({
        where,
        data,
        include,
      });
      return user;
    } catch (error) {
      console.error('Error in UserDAO.updateOne:', error);
      throw error;
    }
  }

  /**
   * Atualiza múltiplos usuários que correspondam aos critérios fornecidos
   * 
   * @param where - Filtros para encontrar os usuários
   * @param data - Dados para atualização
   * @returns Objeto com contagem de usuários atualizados
   * 
   * @example
   * ```typescript
   * const result = await userDAO.updateMany(
   *   { role: 'client', isPremium: false },
   *   { isPremium: true }
   * );
   * console.log(`${result.count} usuários promovidos para premium`);
   * ```
   */
  async updateMany(
    where: Prisma.UserWhereInput,
    data: Prisma.UserUpdateManyMutationInput
  ): Promise<Prisma.BatchPayload> {
    try {
      const result = await prisma.user.updateMany({
        where,
        data,
      });
      return result;
    } catch (error) {
      console.error('Error in UserDAO.updateMany:', error);
      throw error;
    }
  }

  /**
   * Deleta um único usuário que corresponda aos critérios fornecidos
   * 
   * @param where - Filtros para encontrar o usuário
   * @returns Usuário deletado
   * 
   * @example
   * ```typescript
   * const deletedUser = await userDAO.deleteOne({ id: '123' });
   * ```
   */
  async deleteOne(where: Prisma.UserWhereUniqueInput): Promise<User> {
    try {
      const user = await prisma.user.delete({
        where,
      });
      return user;
    } catch (error) {
      console.error('Error in UserDAO.deleteOne:', error);
      throw error;
    }
  }

  /**
   * Deleta múltiplos usuários que correspondam aos critérios fornecidos
   * 
   * @param where - Filtros para encontrar os usuários
   * @returns Objeto com contagem de usuários deletados
   * 
   * @example
   * ```typescript
   * const result = await userDAO.deleteMany({
   *   createdAt: { lt: new Date('2024-01-01') },
   *   role: 'client'
   * });
   * console.log(`${result.count} usuários antigos deletados`);
   * ```
   */
  async deleteMany(where: Prisma.UserWhereInput): Promise<Prisma.BatchPayload> {
    try {
      const result = await prisma.user.deleteMany({
        where,
      });
      return result;
    } catch (error) {
      console.error('Error in UserDAO.deleteMany:', error);
      throw error;
    }
  }

  /**
   * Métodos auxiliares adicionais
   */

  /**
   * Busca um usuário por ID
   * 
   * @param id - ID do usuário
   * @param include - Relações a incluir (opcional)
   * @returns Usuário encontrado ou null
   */
  async findById(id: string, include?: Prisma.UserInclude): Promise<User | null> {
    return this.findOne({ id }, include);
  }

  /**
   * Busca um usuário por email
   * 
   * @param email - Email do usuário
   * @param include - Relações a incluir (opcional)
   * @returns Usuário encontrado ou null
   */
  async findByEmail(email: string, include?: Prisma.UserInclude): Promise<User | null> {
    return this.findOne({ email }, include);
  }

  /**
   * Conta o número de usuários que correspondam aos critérios fornecidos
   * 
   * @param where - Filtros para contagem (opcional)
   * @returns Número de usuários
   */
  async count(where?: Prisma.UserWhereInput): Promise<number> {
    try {
      const count = await prisma.user.count({
        where,
      });
      return count;
    } catch (error) {
      console.error('Error in UserDAO.count:', error);
      throw error;
    }
  }

  /**
   * Verifica se existe um usuário com o email fornecido
   * 
   * @param email - Email a verificar
   * @returns true se existe, false caso contrário
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.count({ email });
    return count > 0;
  }
}

// Exporta uma instância do DAO para uso em toda a aplicação
export const userDAO = new UserDAO();

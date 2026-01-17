import { handleErrors } from '@/utils/handle-errors';
import { UserDAO } from '@/DAO/user';

export const getAllUsers = async (req: any, res: any) => {
  try {
    const dao = new UserDAO();

    // Buscar todos os usuários
    const users = await dao.findMany(
      { active: true },
      undefined,
      { createdAt: 'desc' }
    );

    // Remove o passwordHash da resposta
    const usersWithoutPassword = users.map(({ passwordHash, ...user }) => user);

    // Calcular métricas básicas
    const summary = {
      totalUsers: users.length,
      adminCount: users.filter(u => u.role === 'ADMIN').length,
      managerCount: users.filter(u => u.role === 'MANAGER').length,
      viewerCount: users.filter(u => u.role === 'VIEWER').length,
      activeCount: users.filter(u => u.active).length,
    };

    return res.status(200).send({
      data: {
        summary,
        users: usersWithoutPassword
      }
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

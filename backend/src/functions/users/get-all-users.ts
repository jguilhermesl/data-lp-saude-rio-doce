import { handleErrors } from '@/utils/handle-errors';
import { UserDAO } from '@/DAO/user';
import { prisma } from '@/lib/prisma';

export const getAllUsers = async (req: any, res: any) => {
  try {
    const dao = new UserDAO();

    // Buscar todos os usuários
    const users = await dao.findMany(
      { active: true },
      undefined,
      { createdAt: 'desc' }
    );

    // Buscar métricas de atendimentos para cada usuário
    const usersWithMetrics = await Promise.all(
      users.map(async (user) => {
        const { passwordHash, ...userWithoutPassword } = user;

        // Buscar atendimentos do usuário
        const appointments = await prisma.appointment.findMany({
          where: {
            responsibleUserId: user.id,
          },
          select: {
            id: true,
            paidValue: true,
            examValue: true,
            paymentDone: true,
          },
        });

        // Calcular métricas
        const totalAppointments = appointments.length;
        const totalSales = appointments.reduce((sum, apt) => {
          const value = apt.paidValue || apt.examValue || 0;
          return sum + Number(value);
        }, 0);
        const completedAppointments = appointments.filter(apt => apt.paymentDone).length;

        return {
          ...userWithoutPassword,
          metrics: {
            totalAppointments,
            totalSales,
            completedAppointments,
          },
        };
      })
    );

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
        users: usersWithMetrics
      }
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

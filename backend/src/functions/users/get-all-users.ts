import { handleErrors } from '@/utils/handle-errors';
import { UserDAO } from '@/DAO/user';
import { prisma } from '@/lib/prisma';

export const getAllUsers = async (req: any, res: any) => {
  try {
    const dao = new UserDAO();
    
    // Obter parâmetros de data da query string
    const { startDate, endDate } = req.query;
    
    // Criar filtro de data para os atendimentos
    const dateFilter: any = {};
    
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

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

        // Construir where clause para atendimentos
        const appointmentWhere: any = {
          responsibleUserId: user.id,
        };
        
        // Adicionar filtro de data se fornecido
        if (Object.keys(dateFilter).length > 0) {
          appointmentWhere.appointmentDate = dateFilter;
        }

        // Buscar atendimentos do usuário (filtrado por período se fornecido)
        const appointments = await prisma.appointment.findMany({
          where: appointmentWhere,
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

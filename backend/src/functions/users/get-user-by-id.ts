import { handleErrors } from '@/utils/handle-errors';
import { UserDAO } from '@/DAO/user';
import { prisma } from '@/lib/prisma';

export const getUserById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: 'ID do usuário é obrigatório' });
    }

    const dao = new UserDAO();

    // Buscar usuário
    const user = await dao.findById(id);

    if (!user) {
      return res.status(404).send({ message: 'Usuário não encontrado' });
    }

    // Remove o passwordHash da resposta
    const { passwordHash, ...userWithoutPassword } = user;

    // Buscar atendimentos detalhados do usuário
    const appointments = await prisma.appointment.findMany({
      where: {
        responsibleUserId: id,
      },
      select: {
        id: true,
        externalId: true,
        appointmentDate: true,
        appointmentTime: true,
        paidValue: true,
        examValue: true,
        paymentDone: true,
        insuranceName: true,
        patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    });

    // Calcular métricas gerais
    const totalAppointments = appointments.length;
    const totalSales = appointments.reduce((sum, apt) => {
      const value = apt.paidValue || apt.examValue || 0;
      return sum + Number(value);
    }, 0);
    const completedAppointments = appointments.filter(apt => apt.paymentDone).length;
    const pendingAppointments = appointments.filter(apt => !apt.paymentDone).length;

    // Agrupar por mês
    const appointmentsByMonth = appointments.reduce((acc, apt) => {
      const date = new Date(apt.appointmentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          count: 0,
          sales: 0,
        };
      }
      
      acc[monthKey].count++;
      acc[monthKey].sales += Number(apt.paidValue || apt.examValue || 0);
      
      return acc;
    }, {} as Record<string, { month: string; count: number; sales: number }>);

    const monthlyStats = Object.values(appointmentsByMonth).sort((a, b) => 
      b.month.localeCompare(a.month)
    );

    // Top 5 pacientes mais atendidos
    const patientCounts = appointments.reduce((acc, apt) => {
      if (apt.patient) {
        if (!acc[apt.patient.id]) {
          acc[apt.patient.id] = {
            patientId: apt.patient.id,
            patientName: apt.patient.fullName,
            count: 0,
            totalValue: 0,
          };
        }
        acc[apt.patient.id].count++;
        acc[apt.patient.id].totalValue += Number(apt.paidValue || apt.examValue || 0);
      }
      return acc;
    }, {} as Record<string, { patientId: string; patientName: string; count: number; totalValue: number }>);

    const topPatients = Object.values(patientCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.status(200).send({
      data: {
        user: userWithoutPassword,
        metrics: {
          totalAppointments,
          totalSales,
          completedAppointments,
          pendingAppointments,
        },
        monthlyStats,
        topPatients,
        recentAppointments: appointments.slice(0, 10),
      },
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

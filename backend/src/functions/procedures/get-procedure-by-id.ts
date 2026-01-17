import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const paramsSchema = z.object({
  id: z.string(),
});

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const getProcedureById = async (req: any, res: any) => {
  try {
    const { id } = paramsSchema.parse(req.params);
    const { startDate, endDate } = querySchema.parse(req.query);

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const appointmentDateFilter = Object.keys(dateFilter).length > 0 ? dateFilter : undefined;

    // Get procedure basic information
    const procedure = await prisma.procedure.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        code: true,
        defaultPrice: true,
      },
    });

    if (!procedure) {
      return res.status(404).send({ message: 'Procedimento não encontrado' });
    }

    // Get appointments that include this procedure
    const appointmentProcedures = await prisma.appointmentProcedure.findMany({
      where: {
        procedureId: id,
        ...(appointmentDateFilter && {
          appointment: {
            appointmentDate: appointmentDateFilter,
          },
        }),
      },
      include: {
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            appointmentTime: true,
            examValue: true,
            paidValue: true,
            paymentDone: true,
            insuranceName: true,
            patient: {
              select: {
                id: true,
                fullName: true,
                cpf: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                crm: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointment: {
          appointmentDate: 'desc',
        },
      },
    });

    // Calculate metrics based on appointments that contain this procedure
    const uniqueAppointments = new Map();
    appointmentProcedures.forEach((ap) => {
      if (!uniqueAppointments.has(ap.appointment.id)) {
        uniqueAppointments.set(ap.appointment.id, ap.appointment);
      }
    });

    const appointments = Array.from(uniqueAppointments.values());

    const totalRevenue = appointments.reduce((sum, appointment) => {
      return sum + (appointment.paidValue ? Number(appointment.paidValue) : 0);
    }, 0);

    const totalAppointments = appointments.length;
    const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

    // Get last 10 appointments
    const lastAppointments = appointments.slice(0, 10).map((appointment) => ({
      id: appointment.id,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      examValue: appointment.examValue,
      paidValue: appointment.paidValue,
      paymentDone: appointment.paymentDone,
      insuranceName: appointment.insuranceName,
      patient: appointment.patient,
      doctor: appointment.doctor,
    }));

    // Prepare response
    const response = {
      procedure: {
        id: procedure.id,
        name: procedure.name,
        code: procedure.code,
        defaultPrice: procedure.defaultPrice,
      },
      metrics: {
        totalRevenue,
        totalAppointments,
        averageTicket,
      },
      appointments: lastAppointments,
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    };

    return res.status(200).send({ data: response });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};

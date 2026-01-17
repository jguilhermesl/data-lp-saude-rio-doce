import { handleErrors } from '@/utils/handle-errors';
import { z } from 'zod';
import { doctorDAO } from '@/DAO/doctor';
import { prisma } from '@/lib/prisma';

const paramsSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const getDoctorById = async (req: any, res: any) => {
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

    // Get doctor basic information
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        doctorSpecialties: {
          include: {
            specialty: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).send({ message: 'Médico não encontrado' });
    }

    // Get appointments with filters
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        ...(appointmentDateFilter && { appointmentDate: appointmentDateFilter }),
      },
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
        examsRaw: true,
        appointmentProcedures: {
          select: {
            procedure: {
              select: {
                id: true,
                name: true,
                code: true,
                defaultPrice: true,
              },
            },
            quantity: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    });

    // Calculate metrics
    const totalRevenue = appointments.reduce((sum, appointment) => {
      return sum + (appointment.paidValue ? Number(appointment.paidValue) : 0);
    }, 0);

    const totalAppointments = appointments.length;
    const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

    // Calculate procedures statistics
    const procedureStats: Map<string, { name: string; count: number; revenue: number; code?: string }> = new Map();

    appointments.forEach((appointment) => {
      appointment.appointmentProcedures.forEach((ap) => {
        const procedureId = ap.procedure.id;
        const procedureName = ap.procedure.name;
        const procedureCode = ap.procedure.code;
        const revenue = ap.procedure.defaultPrice ? Number(ap.procedure.defaultPrice) : 0;

        if (procedureStats.has(procedureId)) {
          const stats = procedureStats.get(procedureId)!;
          stats.count += 1;
          stats.revenue += revenue;
        } else {
          procedureStats.set(procedureId, {
            name: procedureName,
            code: procedureCode || undefined,
            count: 1,
            revenue: revenue,
          });
        }
      });
    });

    // Convert to array and sort by revenue
    const proceduresByRevenue = Array.from(procedureStats.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    // Prepare response
    const response = {
      doctor: {
        id: doctor.id,
        name: doctor.name,
        crm: doctor.crm,
        homePhone: doctor.homePhone,
        workPhone: doctor.workPhone,
        mobilePhone: doctor.mobilePhone,
        specialties: doctor.doctorSpecialties.map((ds) => ({
          id: ds.specialty.id,
          name: ds.specialty.name,
        })),
      },
      metrics: {
        totalRevenue,
        totalAppointments,
        averageTicket,
      },
      appointments: appointments.map((appointment) => ({
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        examValue: appointment.examValue,
        paidValue: appointment.paidValue,
        paymentDone: appointment.paymentDone,
        insuranceName: appointment.insuranceName,
        patient: appointment.patient,
        procedures: appointment.appointmentProcedures.map((ap) => ({
          id: ap.procedure.id,
          name: ap.procedure.name,
          code: ap.procedure.code,
          quantity: ap.quantity,
        })),
        examsRaw: appointment.examsRaw,
      })),
      proceduresByRevenue,
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

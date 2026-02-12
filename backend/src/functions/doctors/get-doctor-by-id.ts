import { handleErrors } from '@/utils/handle-errors';
import { calculateTotalRevenue } from '@/utils/calculate-revenue';
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

    // Build date filter for appointments (appointmentDate OR createdDate)
    const dateFilter: any = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      dateFilter.OR = [
        { appointmentDate: { gte: start, lte: end } },
        { createdDate: { gte: start, lte: end } },
      ];
    } else if (startDate) {
      const start = new Date(startDate);
      dateFilter.OR = [
        { appointmentDate: { gte: start } },
        { createdDate: { gte: start } },
      ];
    } else if (endDate) {
      const end = new Date(endDate);
      dateFilter.OR = [
        { appointmentDate: { lte: end } },
        { createdDate: { lte: end } },
      ];
    }

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

    // Get appointments with filters (appointmentDate OR createdDate in period)
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        ...dateFilter,
      },

      select: {
        id: true,
        appointmentDate: true,
        appointmentTime: true,
        createdDate: true,
        status: true,
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

    // Calculate metrics using utility function
    // Use very old/future dates if no period is specified to include all appointments
    const start = startDate ? new Date(startDate) : new Date('1900-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');
    
    const totalRevenue = calculateTotalRevenue(appointments, start, end);

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
        status: appointment.status,
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

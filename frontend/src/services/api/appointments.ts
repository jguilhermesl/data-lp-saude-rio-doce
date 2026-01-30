import { api } from '@/lib/axios';

export interface AppointmentMetricsSummary {
  totalAppointments: number;
  totalRevenue: number;
  averageTicket: number;
  todayAppointments: number;
}

export interface DoctorAppointmentMetrics {
  doctorId: string;
  name: string;
  crm: string | null;
  appointmentCount: number;
  totalRevenue: number;
  averageTicket: number;
}

export interface TimeSeriesData {
  period: Date;
  appointmentCount: number;
  revenue: number;
  received: number;
}

export interface AppointmentProcedure {
  id: string;
  name: string;
  code: string | null;
  quantity: number | null;
}

export interface Patient {
  id: string;
  fullName: string;
  cpf: string | null;
  insuranceName: string | null;
}

export interface Doctor {
  id: string;
  name: string;
  crm: string | null;
}

export interface Specialty {
  id: string;
  name: string;
}

export interface Appointment {
  id: string;
  externalId: string;
  appointmentDate: string;
  appointmentTime: string | null;
  appointmentAt: Date | null;
  insuranceName: string | null;
  examsRaw: string | null;
  examValue: number | null;
  paidValue: number | null;
  paymentDone: boolean;
  patient: Patient | null;
  doctor: Doctor | null;
  specialty: Specialty | null;
  procedures: AppointmentProcedure[];
}

export interface AppointmentsMetricsResponse {
  summary: AppointmentMetricsSummary;
  byDoctor: DoctorAppointmentMetrics[];
  timeSeries: TimeSeriesData[];
  appointments: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface GetAppointmentsMetricsParams {
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
  search?: string;
  doctorId?: string;
  patientId?: string;
  specialtyId?: string;
  insuranceName?: string;
}

export interface AppointmentDetails extends Appointment {
  responsibleUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  appointmentProcedures: {
    id: string;
    appointmentId: string;
    procedureId: string;
    procedure: {
      id: string;
      name: string;
      code: string | null;
      defaultPrice: number | null;
    };
  }[];
}

export const appointmentsApi = {
  getMetrics: async (
    params: GetAppointmentsMetricsParams
  ): Promise<AppointmentsMetricsResponse> => {
    const response = await api.get<{ data: AppointmentsMetricsResponse }>(
      '/appointments/metrics/summary',
      {
        params,
      }
    );
    return response.data.data;
  },

  getById: async (appointmentId: string): Promise<AppointmentDetails> => {
    const response = await api.get<{ data: AppointmentDetails }>(
      `/appointments/${appointmentId}`
    );
    return response.data.data;
  },
};

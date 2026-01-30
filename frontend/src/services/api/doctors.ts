import { api } from '@/lib/axios';

export interface DoctorMetricsSummary {
  totalDoctors: number;
  avgRevenue: number;
  avgAppointments: number;
  avgTicket: number;
  topByRevenue: {
    doctorId: string;
    name: string;
    totalRevenue: number;
  } | null;
  topByAppointments: {
    doctorId: string;
    name: string;
    appointmentCount: number;
  } | null;
}

export interface DoctorMetrics {
  doctorId: string;
  name: string;
  crm: string;
  specialties: Array<{
    id: string;
    name: string;
  }>;
  appointmentCount: number;
  uniquePatients: number;
  totalRevenue: number;
  receivedRevenue: number;
  pendingRevenue: number;
  averageTicket: number;
  productivity: {
    appointmentsPerDay: number;
    totalDays: number;
  };
}

export interface DoctorsMetricsResponse {
  summary: DoctorMetricsSummary;
  doctors: DoctorMetrics[];
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface GetDoctorsMetricsParams {
  startDate: string;
  endDate: string;
  search?: string;
}

export const doctorsApi = {
  getMetrics: async (
    params: GetDoctorsMetricsParams
  ): Promise<DoctorsMetricsResponse> => {
    const response = await api.get<{ data: DoctorsMetricsResponse }>(
      '/doctors/metrics/summary',
      {
        params,
      }
    );
    return response.data.data;
  },
};

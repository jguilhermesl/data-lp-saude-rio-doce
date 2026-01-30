import { api } from '@/lib/axios';

export interface PatientMetricsSummary {
  totalPatients: number;
  recurringPatients: number;
  vipPatientsCount: number;
  patientsAtRiskCount: number;
  churnRate: number;
}

export interface Patient {
  id: string;
  fullName: string;
  cpf: string | null;
  phone: string | null;
  totalSpent: number;
  appointmentCount: number;
  lastAppointmentDate: Date | null;
}

export interface VipPatient {
  patientId: string;
  fullName: string;
  cpf: string | null;
  totalSpent: number;
  totalPaid: number;
  appointmentCount: number;
  lastAppointmentDate: Date | null;
}

export interface PatientAtRisk {
  patientId: string;
  daysSinceLastAppointment: number;
}

export interface PatientsMetricsResponse {
  summary: PatientMetricsSummary;
  segmentation: {
    recurringPatients: number;
    vipPatients: number;
    atRisk: number;
  };
  ltvDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  vipPatients: VipPatient[];
  patientsAtRisk: PatientAtRisk[];
  patients: Patient[];
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

export interface GetPatientsMetricsParams {
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
  search?: string;
  minSpent?: number;
  maxSpent?: number;
  lastAppointmentStartDate?: string;
  lastAppointmentEndDate?: string;
}

export interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime?: string;
  examValue?: number;
  paidValue?: number;
  paymentDone: boolean;
  insuranceName?: string;
  doctor: {
    id: string;
    name: string;
    crm?: string;
  } | null;
  specialty: {
    id: string;
    name: string;
  } | null;
  appointmentProcedures: Array<{
    procedure: {
      id: string;
      name: string;
      code?: string;
    };
  }>;
}

export interface PatientMetrics {
  appointmentCount: number;
  totalSpent: number;
  totalPaid: number;
  pendingAmount: number;
  averageTicket: number;
}

export interface PatientDetails {
  id: string;
  fullName: string;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  lpBenefitsStatus?: string;
  appointments: Appointment[];
  metrics: PatientMetrics;
  _count: {
    appointments: number;
  };
}

export interface GetPatientByIdResponse {
  data: PatientDetails;
}

export const patientsApi = {
  getMetrics: async (
    params: GetPatientsMetricsParams
  ): Promise<PatientsMetricsResponse> => {
    const response = await api.get<{ data: PatientsMetricsResponse }>(
      '/patients/metrics/summary',
      {
        params,
      }
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<PatientDetails> => {
    const response = await api.get<GetPatientByIdResponse>(`/patients/${id}`);
    return response.data.data;
  },
};

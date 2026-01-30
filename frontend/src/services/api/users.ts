import { api } from '@/lib/axios';

export interface UsersSummary {
  totalUsers: number;
  adminCount: number;
  managerCount: number;
  viewerCount: number;
  activeCount: number;
}

export interface UserMetrics {
  totalAppointments: number;
  totalSales: number;
  completedAppointments: number;
  pendingAppointments?: number;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'ADMIN' | 'MANAGER' | 'VIEWER';
  active: boolean;
  createdAt: string;
  updatedAt: string;
  metrics?: UserMetrics;
}

export interface UsersResponse {
  summary: UsersSummary;
  users: User[];
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'VIEWER';
  phone?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
  role?: 'ADMIN' | 'MANAGER' | 'VIEWER';
  active?: boolean;
  phone?: string;
}

export interface MonthlyStats {
  month: string;
  count: number;
  sales: number;
}

export interface TopPatient {
  patientId: string;
  patientName: string;
  count: number;
  totalValue: number;
}

export interface RecentAppointment {
  id: string;
  externalId: string;
  appointmentDate: string;
  appointmentTime: string | null;
  paidValue: number | null;
  examValue: number | null;
  paymentDone: boolean;
  insuranceName: string | null;
  patient: {
    id: string;
    fullName: string;
  } | null;
  doctor: {
    id: string;
    name: string;
  } | null;
}

export interface UserDetailsResponse {
  user: User;
  metrics: UserMetrics;
  monthlyStats: MonthlyStats[];
  topPatients: TopPatient[];
  recentAppointments: RecentAppointment[];
}

export const usersApi = {
  getAll: async (startDate?: Date, endDate?: Date): Promise<UsersResponse> => {
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    
    const response = await api.get<{ data: UsersResponse }>(`/users?${params.toString()}`);
    return response.data.data;
  },

  getById: async (id: string, startDate?: Date, endDate?: Date): Promise<UserDetailsResponse> => {
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    
    const queryString = params.toString();
    const url = queryString ? `/users/${id}?${queryString}` : `/users/${id}`;
    
    const response = await api.get<{ data: UserDetailsResponse }>(url);
    return response.data.data;
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await api.post<{ data: User }>('/users', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await api.put<{ data: User }>(`/users/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

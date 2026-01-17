import { api } from '@/lib/axios';

export interface UsersSummary {
  totalUsers: number;
  adminCount: number;
  managerCount: number;
  viewerCount: number;
  activeCount: number;
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

export const usersApi = {
  getAll: async (): Promise<UsersResponse> => {
    const response = await api.get<{ data: UsersResponse }>('/users');
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

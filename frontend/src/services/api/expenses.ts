import { api } from '@/lib/axios';

export interface Expense {
  id: string;
  payment: string;
  value: number;
  date: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensesResponse {
  expenses: Expense[];
}

export interface CreateExpenseData {
  payment: string;
  value: number;
  date: string;
  category: string;
}

export interface UpdateExpenseData {
  payment?: string;
  value?: number;
  date?: string;
  category?: string;
}

export const expensesApi = {
  getAll: async (): Promise<ExpensesResponse> => {
    const response = await api.get<{ data: ExpensesResponse }>('/expenses');
    return response.data.data;
  },

  create: async (data: CreateExpenseData): Promise<Expense> => {
    const response = await api.post<{ data: Expense }>('/expenses', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateExpenseData): Promise<Expense> => {
    const response = await api.put<{ data: Expense }>(`/expenses/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};

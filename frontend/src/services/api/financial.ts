import { api } from '@/lib/axios';
import { Expense } from './expenses';

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
}

export interface CategoryRanking {
  category: string;
  totalValue: number;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface FinancialMetricsResponse {
  summary: FinancialSummary;
  categoryRanking: CategoryRanking[];
  timeSeries: TimeSeriesData[];
  expenses: Expense[];
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface FinancialMetricsParams {
  startDate: string;
  endDate: string;
  category?: string;
  search?: string;
}

export const financialApi = {
  getMetrics: async (params: FinancialMetricsParams): Promise<FinancialMetricsResponse> => {
    const response = await api.get<{ data: FinancialMetricsResponse }>('/financial/metrics', {
      params,
    });
    return response.data.data;
  },
};

import { api } from '@/lib/axios';

export interface ProcedureMetricsSummary {
  totalProcedures: number;
}

export interface TopSellingProcedure {
  procedureId: string;
  name: string;
  code?: string;
  quantitySold: number;
  timesOrdered: number;
  totalRevenue: number;
  averagePrice: number;
  defaultPrice: number | null;
}

export interface TopRevenueProcedure {
  procedureId: string;
  name: string;
  code?: string;
  totalRevenue: number;
  quantitySold: number;
  timesOrdered: number;
  averagePrice: number;
  defaultPrice: number | null;
}

export interface Procedure {
  id: string;
  name: string;
  code?: string;
  defaultPrice: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    appointmentProcedures: number;
  };
}

export interface ProceduresMetricsResponse {
  summary: ProcedureMetricsSummary;
  topSelling: TopSellingProcedure[];
  topRevenue: TopRevenueProcedure[];
  procedures: Procedure[];
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

export interface GetProceduresMetricsParams {
  startDate: string;
  endDate: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const proceduresApi = {
  getMetrics: async (
    params: GetProceduresMetricsParams
  ): Promise<ProceduresMetricsResponse> => {
    const response = await api.get<{ data: ProceduresMetricsResponse }>(
      '/procedures/metrics/summary',
      {
        params,
      }
    );
    return response.data.data;
  },
};

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface DashboardMetrics {
  financial: {
    totalRevenue: number;
    receivedRevenue: number;
    pendingRevenue: number;
    averageTicket: number;
    paymentRate: number;
    totalAppointments: number;
    totalExpenses: number;
    totalProfit: number;
  };
  doctors: {
    total: number;
    topByRevenue: Array<{
      doctorId: string;
      name: string;
      crm: string | null;
      totalRevenue: number;
    }>;
    bestReturnRate: {
      doctorId: string;
      name: string;
      returnRate: number;
    };
  };
  patients: {
    total: number;
    newPatients: number;
    recurringPatients: number;
    returnRate: number;
  };
  procedures: {
    total: number;
    topSelling: Array<{
      procedureId: string;
      name: string;
      code: string | null;
      quantitySold: number;
      timesOrdered: number;
      totalRevenue: number;
    }>;
  };
  expenses: {
    summary: {
      totalExpenses: number;
    };
    categoryRanking: Array<{
      category: string;
      totalValue: number;
      count: number;
      percentage: number;
    }>;
    timeSeries: Array<{
      period: string;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

interface UseDashboardMetricsParams {
  startDate: string;
  endDate: string;
}

export function useDashboardMetrics({ startDate, endDate }: UseDashboardMetricsParams) {
  return useQuery<DashboardMetrics>({
    queryKey: ["dashboard-metrics", startDate, endDate],
    queryFn: async () => {
      const response = await api.get("/dashboard/metrics", {
        params: { startDate, endDate },
      });
      return response.data.data;
    },
    enabled: !!startDate && !!endDate,
  });
}

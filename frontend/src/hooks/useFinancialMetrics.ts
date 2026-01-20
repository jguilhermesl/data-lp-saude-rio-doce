import { useQuery } from '@tanstack/react-query';
import { financialApi, FinancialMetricsParams } from '@/services/api/financial';

export const useFinancialMetrics = (params: FinancialMetricsParams) => {
  return useQuery({
    queryKey: ['financial-metrics', params],
    queryFn: () => financialApi.getMetrics(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!params.startDate && !!params.endDate,
  });
};

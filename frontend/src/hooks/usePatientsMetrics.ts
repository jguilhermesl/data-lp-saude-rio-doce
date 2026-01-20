import { useQuery } from '@tanstack/react-query';
import { patientsApi, GetPatientsMetricsParams } from '@/services/api/patients';

export const usePatientsMetrics = (params: GetPatientsMetricsParams) => {
  return useQuery({
    queryKey: ['patients-metrics', params.startDate, params.endDate, params.page, params.limit, params.search, params.minSpent, params.maxSpent, params.lastAppointmentStartDate, params.lastAppointmentEndDate],
    queryFn: () => patientsApi.getMetrics(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

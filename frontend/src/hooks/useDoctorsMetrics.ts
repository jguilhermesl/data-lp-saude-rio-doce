import { useQuery } from '@tanstack/react-query';
import { doctorsApi, GetDoctorsMetricsParams } from '@/services/api/doctors';

export const useDoctorsMetrics = (params: GetDoctorsMetricsParams) => {
  return useQuery({
    queryKey: ['doctors-metrics', params.startDate, params.endDate, params.search],
    queryFn: () => doctorsApi.getMetrics(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

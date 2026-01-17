import { useQuery } from '@tanstack/react-query';
import { appointmentsApi, GetAppointmentsMetricsParams } from '@/services/api/appointments';

export const useAppointmentsMetrics = (params: GetAppointmentsMetricsParams) => {
  return useQuery({
    queryKey: ['appointments-metrics', params.startDate, params.endDate, params.page, params.limit, params.search, params.doctorId, params.patientId, params.specialtyId, params.insuranceName],
    queryFn: () => appointmentsApi.getMetrics(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

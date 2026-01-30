import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/services/api/appointments';

export const useAppointmentById = (appointmentId: string) => {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentsApi.getById(appointmentId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!appointmentId,
  });
};

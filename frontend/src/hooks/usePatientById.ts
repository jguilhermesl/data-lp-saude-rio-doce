import { useQuery } from '@tanstack/react-query';
import { patientsApi } from '@/services/api/patients';

export const usePatientById = (patientId: string) => {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientsApi.getById(patientId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!patientId,
  });
};

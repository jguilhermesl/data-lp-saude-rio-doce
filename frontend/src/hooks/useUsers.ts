import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users';

export const useUsers = (startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['users', startDate, endDate],
    queryFn: () => usersApi.getAll(startDate, endDate),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users';

export const useUserById = (userId: string, startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['user', userId, startDate, endDate],
    queryFn: () => usersApi.getById(userId, startDate, endDate),
    enabled: !!userId && userId !== 'new',
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

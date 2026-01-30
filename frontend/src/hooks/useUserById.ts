import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/services/api/users';

export const useUserById = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId && userId !== 'new',
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

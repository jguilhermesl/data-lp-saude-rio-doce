import { useQuery } from '@tanstack/react-query';
import { expensesApi } from '@/services/api/expenses';

export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

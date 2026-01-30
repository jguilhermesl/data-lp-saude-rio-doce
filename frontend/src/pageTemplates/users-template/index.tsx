'use client';

import { PrivateLayout } from '@/components/private-layout';
import { UsersList } from './users-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';

import { useUsers } from '@/hooks/useUsers';
import { DateRangePicker } from '@/components/date-range-picker';

export const UsersTemplate = () => {
  // Período pré-selecionado: mês atual
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const { data, isLoading, isError, refetch } = useUsers(startDate, endDate);
  const router = useRouter();

  const handleCreateUser = () => {
    router.push('/users/new');
  };

  const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // TODO: Get user role from auth context
  const isAdmin = true; // This should come from authentication context

  return (
    <PrivateLayout
      title="Usuários"
      description="Crie, edite e delete usuários do sistema"
      actionsComponent={
        isAdmin ? (
          <Button onClick={handleCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Usuário
          </Button>
        ) : null
      }
    >
      <div className="flex flex-col gap-4">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={handleDateChange}
        />
        <UsersList
          users={data?.users || []}
          isLoading={isLoading}
          isError={isError}
          onRefresh={() => refetch()}
        />
      </div>
    </PrivateLayout>
  );
};

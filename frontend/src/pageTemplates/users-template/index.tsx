'use client';

import { PrivateLayout } from '@/components/private-layout';
import { UsersList } from './users-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useUsers } from '@/hooks/useUsers';

export const UsersTemplate = () => {
  const { data, isLoading, isError, refetch } = useUsers();
  const router = useRouter();

  const handleCreateUser = () => {
    router.push('/company/users/new');
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

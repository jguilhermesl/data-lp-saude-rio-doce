import { PrivateLayout } from '@/components/private-layout';
import { UsersList } from './users-list';
import { UsersTableFilters } from './users-table-filter';

export const UsersTemplate = () => {
  return (
    <PrivateLayout
      title="Usuários"
      description="Crie, edite e delete usuários do sistema"
    >
      <div className="flex flex-col gap-4">
        <UsersTableFilters />
        <UsersList />
      </div>
    </PrivateLayout>
  );
};

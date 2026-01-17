import { Table } from '@/components/ui/table/table';
import { UsersTableRow } from './users-table-row';
import { User } from '@/services/api/users';

interface UsersListProps {
  users: User[];
  isLoading: boolean;
  isError: boolean;
  onRefresh?: () => void;
}

export const UsersList = ({
  users,
  isLoading,
  isError,
  onRefresh,
}: UsersListProps) => {
  const headers = [
    'Nome',
    'E-mail',
    'Telefone',
    'Função',
    'Status',
    'Criado em',
    'Ações',
  ];

  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table headers={headers}>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b animate-pulse">
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border rounded-md p-8 text-center">
        <p className="text-red-500">
          Erro ao carregar usuários. Tente novamente.
        </p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center">
        <p className="text-gray-500">Nenhum usuário encontrado no sistema.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border rounded-md">
        <Table headers={headers}>
          {users.map((user) => {
            return (
              <UsersTableRow key={user.id} user={user} onDelete={onRefresh} />
            );
          })}
        </Table>
      </div>
    </div>
  );
};

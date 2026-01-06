import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UsersTableRow } from './users-table-row';

export const UsersList = () => {
  // TODO: Replace with real API data
  const mockUsers = Array.from({ length: 10 }).map((_, i) => ({
    id: `user-${i + 1}`,
    name: `Usuário ${i + 1}`,
    email: `usuario${i + 1}@example.com`,
    password: '1234',
    phone: `(21) 9${8765 + i}-4321`,
    accessType: i % 3 === 0 ? 'Admin' : 'Membro',
  }));

  return (
    <div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Senha</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Tipo de acesso</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => {
              return <UsersTableRow key={user.id} user={user} />;
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

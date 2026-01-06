'use client';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UsersTableRowProps {
  user: {
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    accessType: string;
  };
}

export const UsersTableRow = ({ user }: UsersTableRowProps) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/company/users/${user.id}`);
  };

  const handleEdit = () => {
    router.push(`/company/users/${user.id}`);
  };

  const handleDelete = () => {
    // TODO: Implement delete logic with confirmation dialog
    if (confirm(`Tem certeza que deseja deletar o usuário ${user.name}?`)) {
      console.log('Deleting user:', user.id);
      // API call to delete user would go here
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.password}</TableCell>
      <TableCell>{user.phone}</TableCell>
      <TableCell>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.accessType === 'Admin'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {user.accessType}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleViewDetails}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

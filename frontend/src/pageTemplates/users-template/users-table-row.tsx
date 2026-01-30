/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { User, usersApi } from '@/services/api/users';
import { useState } from 'react';
import { toast } from 'sonner';

interface UsersTableRowProps {
  user: User;
  onDelete?: () => void;
}

export const UsersTableRow = ({ user, onDelete }: UsersTableRowProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetails = () => {
    router.push(`/users/${user.id}`);
  };
  
  const handleDelete = () => {
    toast(
      `Tem certeza que deseja deletar o usuário ${user.name || user.email}?`,
      {
        description: 'Esta ação não pode ser desfeita.',
        action: {
          label: 'Confirmar',
          onClick: async () => {
            try {
              setIsDeleting(true);
              await usersApi.delete(user.id);
              toast.success('Usuário deletado com sucesso!');
              // Callback to refresh the list
              if (onDelete) {
                onDelete();
              }
            } catch (error: any) {
              console.error('Error deleting user:', error);
              toast.error(
                error?.response?.data?.message ||
                  'Erro ao deletar usuário. Tente novamente.',
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
        cancel: {
          label: 'Cancelar',
          onClick: () => {},
        },
      },
    );
  };

  const getRoleName = (role: string) => {
    const roleNames = {
      ADMIN: 'Administrador',
      MANAGER: 'Gerente',
      VIEWER: 'Visualizador',
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      ADMIN: 'bg-purple-100 text-purple-700',
      MANAGER: 'bg-blue-100 text-blue-700',
      VIEWER: 'bg-gray-100 text-gray-700',
    };
    return (
      roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-700'
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone) return '-';

    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');

    // Aplica a máscara ## #####-####
    if (numbers.length === 11) {
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }

    // Retorna o valor original se não tiver 11 dígitos
    return phone;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Table.Row>
      <Table.Col className="font-medium">{user.name || 'Sem nome'}</Table.Col>
      <Table.Col>{user.email}</Table.Col>
      <Table.Col>{formatPhoneNumber(user.phone)}</Table.Col>
      <Table.Col>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}
        >
          {getRoleName(user.role)}
        </span>
      </Table.Col>
      <Table.Col>
        <span className="text-sm font-medium text-gray-900">
          {user.metrics?.totalAppointments || 0}
        </span>
      </Table.Col>
      <Table.Col>
        <span className="text-sm font-semibold text-green-600">
          {formatCurrency(user.metrics?.totalSales || 0)}
        </span>
      </Table.Col>
      <Table.Col>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            user.active
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {user.active ? 'Ativo' : 'Inativo'}
        </span>
      </Table.Col>
      <Table.Col>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleViewDetails}>
            <Eye className="h-4 w-4" />
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
      </Table.Col>
    </Table.Row>
  );
};

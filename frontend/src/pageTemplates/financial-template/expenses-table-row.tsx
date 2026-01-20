/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { Expense, expensesApi } from '@/services/api/expenses';
import { useState } from 'react';
import { toast } from 'sonner';

interface ExpensesTableRowProps {
  expense: Expense;
  onDelete?: () => void;
  onEdit?: (expense: Expense) => void;
}

export const ExpensesTableRow = ({
  expense,
  onDelete,
  onEdit,
}: ExpensesTableRowProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(expense);
    }
  };

  const handleDelete = () => {
    toast(`Tem certeza que deseja deletar a despesa ${expense.payment}?`, {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Confirmar',
        onClick: async () => {
          try {
            setIsDeleting(true);
            await expensesApi.delete(expense.id);
            toast.success('Despesa deletada com sucesso!');
            // Callback to refresh the list
            if (onDelete) {
              onDelete();
            }
          } catch (error: any) {
            console.error('Error deleting expense:', error);
            toast.error(
              error?.response?.data?.message ||
                'Erro ao deletar despesa. Tente novamente.',
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
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      Salários: 'bg-blue-100 text-blue-700',
      Impostos: 'bg-red-100 text-red-700',
      Aluguel: 'bg-purple-100 text-purple-700',
      Equipamentos: 'bg-green-100 text-green-700',
      Materiais: 'bg-yellow-100 text-yellow-700',
      Serviços: 'bg-indigo-100 text-indigo-700',
      Outros: 'bg-gray-100 text-gray-700',
    };
    return categoryColors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Table.Row>
      <Table.Col className="font-medium">{expense.payment}</Table.Col>
      <Table.Col className="font-semibold text-green-600">
        {formatCurrency(expense.value)}
      </Table.Col>
      <Table.Col>{formatDate(expense.date)}</Table.Col>
      <Table.Col>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(expense.category)}`}
        >
          {expense.category}
        </span>
      </Table.Col>
      <Table.Col>{formatDate(expense.createdAt)}</Table.Col>
      <Table.Col>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </Table.Col>
    </Table.Row>
  );
};

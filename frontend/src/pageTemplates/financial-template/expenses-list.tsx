import { Table } from '@/components/ui/table/table';
import { ExpensesTableRow } from './expenses-table-row';
import { Expense } from '@/services/api/expenses';

interface ExpensesListProps {
  expenses: Expense[];
  isLoading: boolean;
  isError: boolean;
  onRefresh?: () => void;
  onEdit?: (expense: Expense) => void;
}

export const ExpensesList = ({
  expenses,
  isLoading,
  isError,
  onRefresh,
  onEdit,
}: ExpensesListProps) => {
  const headers = [
    'Pagamento',
    'Valor',
    'Data',
    'Categoria',
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
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
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
          Erro ao carregar despesas. Tente novamente.
        </p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center">
        <p className="text-gray-500">Nenhuma despesa encontrada no sistema.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border rounded-md">
        <Table headers={headers}>
          {expenses.map((expense) => {
            return (
              <ExpensesTableRow
                key={expense.id}
                expense={expense}
                onDelete={onRefresh}
                onEdit={onEdit}
              />
            );
          })}
        </Table>
      </div>
    </div>
  );
};

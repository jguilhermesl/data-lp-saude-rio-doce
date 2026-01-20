'use client';

import { useState } from 'react';
import { PrivateLayout } from '@/components/private-layout';
import { ExpensesList } from './expenses-list';
import { ExpenseFormDialog } from './expense-form-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/services/api/expenses';

export const FinancialTemplate = () => {
  const { data, isLoading, isError, refetch } = useExpenses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleCreateExpense = () => {
    setSelectedExpense(null);
    setIsDialogOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedExpense(null);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <PrivateLayout
      title="Despesas"
      description="Visualize e gerencie suas despesas"
      actionsComponent={
        <Button onClick={handleCreateExpense}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <ExpensesList
          expenses={data?.expenses || []}
          isLoading={isLoading}
          isError={isError}
          onRefresh={() => refetch()}
          onEdit={handleEditExpense}
        />
      </div>

      <ExpenseFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        expense={selectedExpense}
      />
    </PrivateLayout>
  );
};

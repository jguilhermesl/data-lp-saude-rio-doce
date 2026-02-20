'use client';

import { useState, useMemo, useEffect } from 'react';
import { PrivateLayout } from '@/components/private-layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { FinancialDateFilters } from './financial-date-filters';
import { FinancialSearchFilters } from './financial-search-filters';
import { FinancialMetricCards } from './financial-metric-cards';
import { FinancialCategoryRanking } from './financial-category-ranking';
import { FinancialChart } from './financial-chart';
import { FinancialExportButtons } from './financial-export-buttons';
import { ExpensesList } from './expenses-list';
import { ExpenseFormDialog } from './expense-form-dialog';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/services/api/expenses';
import { toLocalISOString } from '@/lib/utils/date';

export const FinancialTemplate = () => {
  // Estado para controlar o período selecionado (padrão: mês atual)
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    };
  });

  // Estado para controlar filtros
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Estado para diálogo de despesa
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Debounce para o campo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Converte as datas para o formato ISO para a API (sem conversão de timezone)
  const { startDate, endDate } = useMemo(() => {
    const from = dateRange.from || new Date();
    const to = dateRange.to || new Date();
    
    // Data final deve ir com 23:59:59
    const toWithTime = new Date(
      to.getFullYear(),
      to.getMonth(),
      to.getDate(),
      23,
      59,
      59
    );
    
    return {
      startDate: toLocalISOString(from),
      endDate: toLocalISOString(toWithTime),
    };
  }, [dateRange]);

  // Buscar métricas financeiras
  const { data, isLoading, isError, refetch } = useFinancialMetrics({ 
    startDate, 
    endDate,
    category: category || undefined,
    search: debouncedSearch || undefined,
  });

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
      title="Financeiro"
      description="Visualize e gerencie seu financeiro"
      actionsComponent={
        <Button onClick={handleCreateExpense}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Filtros de Data e Botões de Exportação */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <FinancialDateFilters 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <FinancialExportButtons
            data={data}
            dateRange={dateRange}
            category={category}
            search={search}
            isLoading={isLoading}
          />
        </div>

        {/* Cards de Métricas */}
        <FinancialMetricCards 
          summary={data?.summary} 
          isLoading={isLoading} 
          isError={isError} 
        />

        {/* Grid: Ranking + Gráfico (se aplicável) */}
        <div className={`grid grid-cols-1 gap-6 ${
          data?.timeSeries && data.timeSeries.length > 0 
            ? 'lg:grid-cols-2' 
            : ''
        }`}>
          {/* Ranking de Categorias */}
          <FinancialCategoryRanking
            categoryRanking={data?.categoryRanking || []}
            isLoading={isLoading}
            isFullWidth={!data?.timeSeries || data.timeSeries.length === 0}
          />

          {/* Gráfico de Evolução (apenas se houver série temporal) */}
          {data?.timeSeries && data.timeSeries.length > 0 && (
            <FinancialChart
              timeSeries={data.timeSeries}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Filtros de Busca e Categoria logo acima da tabela de despesas */}
        <FinancialSearchFilters 
          category={category}
          onCategoryChange={setCategory}
          search={search}
          onSearchChange={setSearch}
        />

        {/* Lista de Despesas */}
        <ExpensesList
          expenses={data?.expenses || []}
          isLoading={isLoading}
          isError={isError}
          onRefresh={() => refetch()}
          onEdit={handleEditExpense}
        />
      </div>

      {/* Diálogo de Nova/Editar Despesa */}
      <ExpenseFormDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        expense={selectedExpense}
      />
    </PrivateLayout>
  );
};

'use client';

import { FinancialSummary } from '@/services/api/financial';

interface FinancialMetricCardsProps {
  summary?: FinancialSummary;
  isLoading: boolean;
  isError: boolean;
}

export const FinancialMetricCards = ({
  summary,
  isLoading,
  isError,
}: FinancialMetricCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Não foi possível carregar as métricas.</p>
      </div>
    );
  }

  const profitColor = summary.totalProfit >= 0 ? 'text-green-700' : 'text-red-700';
  const profitBg = summary.totalProfit >= 0 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100';
  const profitBorder = summary.totalProfit >= 0 ? 'border-green-200' : 'border-red-200';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Faturamento Total */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-lg">💰</span>
          </div>
          <h3 className="text-blue-800 text-sm font-semibold">
            Faturamento Total
          </h3>
        </div>
        <p className="text-3xl font-bold text-blue-900 mt-3">
          {formatCurrency(summary.totalRevenue)}
        </p>
        <p className="text-xs text-blue-700 mt-2">
          Receita total do período
        </p>
      </div>

      {/* Despesas Totais */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow-sm border border-orange-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
            <span className="text-white text-lg">💸</span>
          </div>
          <h3 className="text-orange-800 text-sm font-semibold">
            Despesas Totais
          </h3>
        </div>
        <p className="text-3xl font-bold text-orange-900 mt-3">
          {formatCurrency(summary.totalExpenses)}
        </p>
        <p className="text-xs text-orange-700 mt-2">
          Gastos totais do período
        </p>
      </div>

      {/* Lucro Total */}
      <div className={`bg-gradient-to-br ${profitBg} p-6 rounded-lg shadow-sm border ${profitBorder}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-full ${summary.totalProfit >= 0 ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center`}>
            <span className="text-white text-lg">
              {summary.totalProfit >= 0 ? '📈' : '📉'}
            </span>
          </div>
          <h3 className={`${summary.totalProfit >= 0 ? 'text-green-800' : 'text-red-800'} text-sm font-semibold`}>
            Lucro Total
          </h3>
        </div>
        <p className={`text-3xl font-bold ${profitColor} mt-3`}>
          {formatCurrency(summary.totalProfit)}
        </p>
        <p className={`text-xs ${summary.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'} mt-2`}>
          {summary.totalProfit >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
        </p>
      </div>
    </div>
  );
};

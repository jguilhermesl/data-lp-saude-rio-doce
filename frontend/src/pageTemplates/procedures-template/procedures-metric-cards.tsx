'use client';

import {
  ProcedureMetricsSummary,
  TopSellingProcedure,
  TopRevenueProcedure,
} from '@/services/api/procedures';

interface ProceduresMetricCardsProps {
  summary?: ProcedureMetricsSummary;
  topSelling?: TopSellingProcedure[];
  topRevenue?: TopRevenueProcedure[];
  isLoading: boolean;
  isError: boolean;
}

export const ProceduresMetricCards = ({
  summary,
  topSelling,
  topRevenue,
  isLoading,
  isError,
}: ProceduresMetricCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
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
        <p className="text-yellow-800">
          Não foi possível carregar as métricas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Gerais */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Visão Geral
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {/* Total de Procedimentos */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">
              Total de Procedimentos
            </h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {summary.totalProcedures}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Todos os procedimentos cadastrados no sistema
            </p>
          </div>
        </div>
      </div>

      {/* Top 10 Tables Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Mais Vendidos */}
        {topSelling && topSelling.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top 10 Mais Vendidos (Volume)
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Procedimento
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Atendimentos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Faturamento
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topSelling.map((procedure) => (
                      <tr
                        key={procedure.procedureId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                          {procedure.name}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900 text-right">
                          {procedure.timesOrdered}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(procedure.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Top 10 Maior Faturamento */}
        {topRevenue && topRevenue.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top 10 Maior Faturamento
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Procedimento
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Atendimentos
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Faturamento
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topRevenue.map((procedure) => (
                      <tr
                        key={procedure.procedureId}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                          {procedure.name}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900 text-right">
                          {procedure.timesOrdered}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900 text-right">
                          {formatCurrency(procedure.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

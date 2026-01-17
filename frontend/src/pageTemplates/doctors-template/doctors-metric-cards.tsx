'use client';

import { DoctorMetricsSummary } from '@/services/api/doctors';

interface DoctorsMetricCardsProps {
  summary?: DoctorMetricsSummary;
  isLoading: boolean;
  isError: boolean;
}

export const DoctorsMetricCards = ({ 
  summary, 
  isLoading, 
  isError 
}: DoctorsMetricCardsProps) => {
  const metrics = summary;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
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

  if (isError || !metrics) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Não foi possível carregar as métricas.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total de Médicos */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Total de Médicos</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {metrics.totalDoctors}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Todos os médicos cadastrados no sistema
            </p>
          </div>

          {/* Faturamento Médio */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Faturamento Médio</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(metrics.avgRevenue)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Média de faturamento por médico (apenas médicos com faturamento)
            </p>
          </div>

          {/* Atendimentos Médios */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">
              Atendimentos Médios
            </h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {Math.round(metrics.avgAppointments)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Média de consultas por médico (apenas médicos com atendimentos)
            </p>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Ticket Médio</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(metrics.avgTicket)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Valor médio por consulta realizada
            </p>
          </div>

          {/* Taxa de Retorno Média */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">
              Taxa de Retorno Média
            </h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatPercentage(metrics.avgReturnRate)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              % de pacientes que retornaram para nova consulta
            </p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Destaques do Período
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Faturamento */}
          {metrics.topByRevenue && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-sm border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-lg">💰</span>
                </div>
                <h3 className="text-green-800 text-sm font-semibold">
                  Maior Faturamento
                </h3>
              </div>
              <p className="text-gray-900 font-semibold text-base mt-3 line-clamp-2">
                {metrics.topByRevenue.name}
              </p>
              <p className="text-2xl font-bold text-green-700 mt-2">
                {formatCurrency(metrics.topByRevenue.totalRevenue)}
              </p>
            </div>
          )}

          {/* Top Atendimentos */}
          {metrics.topByAppointments && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-sm border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
                </div>
                <h3 className="text-blue-800 text-sm font-semibold">
                  Mais Atendimentos
                </h3>
              </div>
              <p className="text-gray-900 font-semibold text-base mt-3 line-clamp-2">
                {metrics.topByAppointments.name}
              </p>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                {metrics.topByAppointments.appointmentCount} atendimentos
              </p>
            </div>
          )}

          {/* Top Taxa de Retorno */}
          {metrics.topByReturnRate && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-sm border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-lg">🔄</span>
                </div>
                <h3 className="text-purple-800 text-sm font-semibold">
                  Maior Taxa de Retorno
                </h3>
              </div>
              <p className="text-gray-900 font-semibold text-base mt-3 line-clamp-2">
                {metrics.topByReturnRate.name}
              </p>
              <p className="text-2xl font-bold text-purple-700 mt-2">
                {formatPercentage(metrics.topByReturnRate.returnRate)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

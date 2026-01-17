'use client';

import { AppointmentMetricsSummary } from '@/services/api/appointments';

interface AppointmentsMetricCardsProps {
  summary?: AppointmentMetricsSummary;
  isLoading: boolean;
}

export const AppointmentsMetricCards = ({ 
  summary, 
  isLoading 
}: AppointmentsMetricCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total de Atendimentos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium">Total de Atendimentos</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {summary?.totalAppointments || 0}
        </p>
      </div>

      {/* Faturamento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium">Faturamento</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {formatCurrency(summary?.totalRevenue || 0)}
        </p>
      </div>

      {/* Ticket Médio */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium">Ticket Médio</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {formatCurrency(summary?.averageTicket || 0)}
        </p>
      </div>
    </div>
  );
};

'use client';

import { PatientMetricsSummary } from '@/services/api/patients';

interface PatientsMetricCardsProps {
  summary?: PatientMetricsSummary;
  isLoading: boolean;
}

export const PatientsMetricCards = ({ 
  summary, 
  isLoading 
}: PatientsMetricCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total de Pacientes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium">Total de Pacientes</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {summary?.totalPatients || 0}
        </p>
      </div>

      {/* Pacientes Recorrentes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium">Pacientes Recorrentes</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {summary?.recurringPatients || 0}
        </p>
      </div>
    </div>
  );
};

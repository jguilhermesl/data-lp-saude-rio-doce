'use client';

import { VipPatient } from '@/services/api/patients';
import { useState } from 'react';

interface PatientsVipListProps {
  vipPatients: VipPatient[];
  isLoading: boolean;
}

export const PatientsVipList = ({ vipPatients, isLoading }: PatientsVipListProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ranking de Pacientes VIP
        </h3>
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!vipPatients || vipPatients.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ranking de Pacientes VIP
        </h3>
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Pegar os top 10 pacientes (já vem ordenado do backend)
  const topPatients = vipPatients.slice(0, 10);

  // Calcular o máximo para normalizar as barras
  const maxSpent = Math.max(...topPatients.map(p => p.totalSpent || 0));

  // Gerar cores para cada paciente
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // green-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
    '#84cc16', // lime-500
  ];

  const totalSpent = topPatients.reduce((sum, p) => sum + (p.totalSpent || 0), 0);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${isExpanded ? 'p-6' : 'p-4'}`}>
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isExpanded ? 'mb-6' : 'mb-0'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-md transition-colors"
            aria-label={isExpanded ? 'Retrair' : 'Expandir'}
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                isExpanded ? 'rotate-0' : '-rotate-90'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            Top 10 Pacientes por Gasto Total
          </h3>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-gray-500">Gasto Total (Top 10)</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
        </div>
      </div>
      
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4 overflow-x-hidden">
          {topPatients.map((patient, index) => {
            const spent = patient.totalSpent || 0;
            const percentage = maxSpent > 0 ? ((spent / maxSpent) * 100) : 0;
            const spentPercentage = totalSpent > 0 ? ((spent / totalSpent) * 100).toFixed(1) : '0.0';
            
            return (
              <div key={patient.patientId} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold mt-0.5" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {patient.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {patient.appointmentCount} atendimento{patient.appointmentCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                      {formatCurrency(spent)}
                    </p>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {spentPercentage}%
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 ml-7">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: colors[index % colors.length],
                      minWidth: percentage > 0 ? '2%' : '0%',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

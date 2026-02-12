'use client';

import { useState } from 'react';
import { PrivateLayout } from '@/components/private-layout';
import {
  Send,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Mock data types
interface DispatchData {
  id: string;
  specialty: string;
  date: string;
  peopleCount: number;
  successRate: number;
  status: 'success' | 'error';
}

// Mock data for different cycles
const mockData: Record<number, DispatchData[]> = {
  1: [
    {
      id: '1',
      specialty: 'Cardiologia',
      date: '2026-01-15',
      peopleCount: 45,
      successRate: 92.5,
      status: 'success',
    },
    {
      id: '2',
      specialty: 'Ortopedia',
      date: '2026-01-20',
      peopleCount: 32,
      successRate: 87.8,
      status: 'success',
    },
    {
      id: '3',
      specialty: 'Pediatria',
      date: '2026-01-25',
      peopleCount: 28,
      successRate: 65.2,
      status: 'error',
    },
  ],
  3: [
    {
      id: '4',
      specialty: 'Cardiologia',
      date: '2025-12-10',
      peopleCount: 120,
      successRate: 89.3,
      status: 'success',
    },
    {
      id: '5',
      specialty: 'Dermatologia',
      date: '2025-11-28',
      peopleCount: 85,
      successRate: 94.1,
      status: 'success',
    },
    {
      id: '6',
      specialty: 'Ortopedia',
      date: '2025-12-15',
      peopleCount: 95,
      successRate: 82.6,
      status: 'success',
    },
    {
      id: '7',
      specialty: 'Neurologia',
      date: '2026-01-05',
      peopleCount: 42,
      successRate: 58.3,
      status: 'error',
    },
    {
      id: '8',
      specialty: 'Pediatria',
      date: '2025-12-20',
      peopleCount: 67,
      successRate: 91.2,
      status: 'success',
    },
  ],
  6: [
    {
      id: '9',
      specialty: 'Cardiologia',
      date: '2025-08-15',
      peopleCount: 230,
      successRate: 91.7,
      status: 'success',
    },
    {
      id: '10',
      specialty: 'Ortopedia',
      date: '2025-09-10',
      peopleCount: 189,
      successRate: 88.4,
      status: 'success',
    },
    {
      id: '11',
      specialty: 'Dermatologia',
      date: '2025-10-05',
      peopleCount: 156,
      successRate: 93.8,
      status: 'success',
    },
    {
      id: '12',
      specialty: 'Pediatria',
      date: '2025-11-12',
      peopleCount: 142,
      successRate: 85.9,
      status: 'success',
    },
    {
      id: '13',
      specialty: 'Neurologia',
      date: '2025-09-25',
      peopleCount: 98,
      successRate: 72.4,
      status: 'error',
    },
    {
      id: '14',
      specialty: 'Ginecologia',
      date: '2025-10-18',
      peopleCount: 175,
      successRate: 89.7,
      status: 'success',
    },
    {
      id: '15',
      specialty: 'Urologia',
      date: '2025-11-30',
      peopleCount: 88,
      successRate: 94.3,
      status: 'success',
    },
  ],
};

export const AfterSalesTemplate = () => {
  const [selectedCycle, setSelectedCycle] = useState<1 | 3 | 6>(1);
  const router = useRouter();

  const currentData = mockData[selectedCycle];

  // Calculate metrics based on selected cycle
  const totalDispatches = currentData.length;
  const totalPeople = currentData.reduce(
    (acc, item) => acc + item.peopleCount,
    0,
  );
  const averageSuccessRate =
    currentData.reduce((acc, item) => acc + item.successRate, 0) /
    currentData.length;
  const successfulDispatches = currentData.filter(
    (item) => item.status === 'success',
  ).length;

  const handleDispatchClick = (dispatchId: string) => {
    // Redirect to detailed view
    router.push(`/after-sales/${dispatchId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const cycleOptions = [
    { value: 1 as const, label: '1 Mês' },
    { value: 3 as const, label: '3 Meses' },
    { value: 6 as const, label: '6 Meses' },
  ];

  return (
    <PrivateLayout
      title="Métricas de Disparos"
      description="Acompanhamento e análise dos disparos de comunicação por ciclo"
    >
      <div className="flex flex-col gap-6">
        {/* Cycle Selection Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <div className="flex gap-1">
            {cycleOptions.map((option) => {
              const isSelected = selectedCycle === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedCycle(option.value)}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
                    isSelected
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Disparos
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalDispatches}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Pessoas
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {totalPeople}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Taxa Média de Sucesso
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {averageSuccessRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Disparos Bem-Sucedidos
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {successfulDispatches}/{totalDispatches}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Disparos do Ciclo de {selectedCycle}{' '}
              {selectedCycle === 1 ? 'Mês' : 'Meses'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Clique em um item para ver os detalhes do disparo
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pessoas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Sucesso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((dispatch) => (
                  <tr
                    key={dispatch.id}
                    onClick={() => handleDispatchClick(dispatch.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {formatDate(dispatch.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {dispatch.peopleCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full max-w-[120px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {dispatch.successRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                'h-2 rounded-full transition-all',
                                dispatch.successRate >= 80
                                  ? 'bg-green-500'
                                  : dispatch.successRate >= 60
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500',
                              )}
                              style={{ width: `${dispatch.successRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {dispatch.status === 'success' ? (
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-green-700">
                            Sucesso
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="w-5 h-5 text-red-500 mr-2" />
                          <span className="text-sm font-medium text-red-700">
                            Erro
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {currentData.length === 0 && (
            <div className="flex items-center justify-center h-64 p-6">
              <div className="text-center">
                <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Nenhum disparo encontrado</p>
                <p className="text-gray-400 text-sm">
                  Não há dados para o ciclo selecionado
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};

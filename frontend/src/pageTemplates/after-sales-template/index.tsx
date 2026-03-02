'use client';

import { useState, useMemo } from 'react';
import { PrivateLayout } from '@/components/private-layout';
import {
  Send,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BirthdaysCard } from '@/components/birthdays-card';
import { useDispatchReports, type CadenceType } from '@/hooks/useDispatchReports';

export const AfterSalesTemplate = () => {
  const [selectedCycle, setSelectedCycle] = useState<1 | 2 | 3>(1);
  const router = useRouter();

  // Mapeia o ciclo selecionado para a cadência correspondente
  const cadenceFilter = useMemo<CadenceType>(() => {
    const cadenceMap: Record<1 | 2 | 3, CadenceType> = {
      1: 'THIRTY_DAYS',
      2: 'SIXTY_DAYS',
      3: 'NINETY_DAYS',
    };
    return cadenceMap[selectedCycle];
  }, [selectedCycle]);

  // Busca relatórios da API filtrando pela cadência
  const { data: dispatches, isLoading, error } = useDispatchReports({ cadence: cadenceFilter });

  // Calcula métricas
  const metrics = useMemo(() => {
    if (!dispatches || dispatches.length === 0) {
      return {
        totalDispatches: 0,
        totalPeople: 0,
        averageSuccessRate: 0,
        successfulDispatches: 0,
      };
    }

    const totalDispatches = dispatches.length;
    const totalPeople = dispatches.reduce(
      (acc, dispatch) => acc + dispatch.totalPatients,
      0
    );

    const successfulDispatches = dispatches.filter(
      (dispatch) => dispatch.status === 'COMPLETED'
    ).length;

    // Calcula taxa média de sucesso
    const avgSuccess = dispatches.reduce((acc, dispatch) => {
      const rate = dispatch.totalPatients > 0
        ? (dispatch.successCount / dispatch.totalPatients) * 100
        : 0;
      return acc + rate;
    }, 0) / totalDispatches;

    return {
      totalDispatches,
      totalPeople,
      averageSuccessRate: avgSuccess,
      successfulDispatches,
    };
  }, [dispatches]);

  const handleDispatchClick = (dispatchId: string) => {
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

  const getCadenceLabel = (cadence: string) => {
    const labels: Record<string, string> = {
      THIRTY_DAYS: '30 dias',
      SIXTY_DAYS: '60 dias',
      NINETY_DAYS: '90 dias',
    };
    return labels[cadence] || cadence;
  };

  const getStatusInfo = (status: string, successRate: number) => {
    if (status === 'COMPLETED') {
      if (successRate >= 80) {
        return { icon: CheckCircle, color: 'text-green-500', label: 'Sucesso', bgColor: 'text-green-700' };
      } else if (successRate >= 60) {
        return { icon: AlertCircle, color: 'text-yellow-500', label: 'Parcial', bgColor: 'text-yellow-700' };
      } else {
        return { icon: XCircle, color: 'text-red-500', label: 'Baixo', bgColor: 'text-red-700' };
      }
    } else if (status === 'IN_PROGRESS') {
      return { icon: Loader2, color: 'text-blue-500', label: 'Em Andamento', bgColor: 'text-blue-700' };
    } else if (status === 'FAILED') {
      return { icon: XCircle, color: 'text-red-500', label: 'Falhou', bgColor: 'text-red-700' };
    }
    return { icon: Send, color: 'text-gray-500', label: 'Pendente', bgColor: 'text-gray-700' };
  };

  const cycleOptions = [
    { value: 1 as const, label: '1 Mês' },
    { value: 2 as const, label: '2 Meses' },
    { value: 3 as const, label: '3 Meses' },
  ];

  return (
    <PrivateLayout
      title="Pós Venda"
      description="Acompanhamento e análise dos disparos de comunicação por ciclo e os aniversariantes do dia"
    >
      <div className="flex flex-col gap-6">
      

        {/* Cycle Selection Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-1">
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
                        : 'text-gray-600 bg-gray-50 hover:bg-gray-100',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
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
                  {isLoading ? '...' : metrics.totalDispatches}
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
                  {isLoading ? '...' : metrics.totalPeople}
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
                  {isLoading ? '...' : `${metrics.averageSuccessRate.toFixed(1)}%`}
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
                  {isLoading ? '...' : `${metrics.successfulDispatches}/${metrics.totalDispatches}`}
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

          {isLoading ? (
            <div className="flex items-center justify-center h-64 p-6">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Carregando disparos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 p-6">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Erro ao carregar disparos</p>
                <p className="text-gray-400 text-sm">
                  Tente novamente mais tarde
                </p>
              </div>
            </div>
          ) : !dispatches || dispatches.length === 0 ? (
            <div className="flex items-center justify-center h-64 p-6">
              <div className="text-center">
                <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Nenhum disparo encontrado</p>
                <p className="text-gray-400 text-sm">
                  Não há dados para o período selecionado
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadência
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
                  {dispatches.map((dispatch) => {
                    const successRate = dispatch.totalPatients > 0
                      ? (dispatch.successCount / dispatch.totalPatients) * 100
                      : 0;
                    const statusInfo = getStatusInfo(dispatch.status, successRate);
                    const StatusIcon = statusInfo.icon;

                    return (
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
                          <div className="text-sm font-medium text-gray-900">
                            {getCadenceLabel(dispatch.cadence)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {dispatch.totalPatients}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full max-w-[120px]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {successRate.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={cn(
                                    'h-2 rounded-full transition-all',
                                    successRate >= 80
                                      ? 'bg-green-500'
                                      : successRate >= 60
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500',
                                  )}
                                  style={{ width: `${successRate}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StatusIcon className={cn('w-5 h-5 mr-2', statusInfo.color, dispatch.status === 'IN_PROGRESS' && 'animate-spin')} />
                            <span className={cn('text-sm font-medium', statusInfo.bgColor)}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

          {/* Birthdays Card - Quick Access */}
        <BirthdaysCard />
      </div>
    </PrivateLayout>
  );
};

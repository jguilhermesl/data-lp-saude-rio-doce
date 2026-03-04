'use client';

import { useState } from 'react';
import { PrivateLayout } from '@/components/private-layout';
import {
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  User,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Loader2,
  MessageSquare,
  LucideIcon,
  SmilePlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDispatchById, useUpdateItemSatisfaction, useUpdateItemLeadStatus, SatisfactionLevel, LeadResponseStatus } from '@/hooks/useDispatchReports';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DispatchNotesModal } from '@/components/dispatch-notes-modal';

interface DispatchDetailsTemplateProps {
  dispatchId: string;
}

export const DispatchDetailsTemplate = ({ dispatchId }: DispatchDetailsTemplateProps) => {
  const router = useRouter();
  const { data: dispatch, isLoading, error } = useDispatchById(dispatchId);
  const updateSatisfaction = useUpdateItemSatisfaction(dispatchId);
  const updateLeadStatus = useUpdateItemLeadStatus(dispatchId);
  const [notesModalState, setNotesModalState] = useState<{ isOpen: boolean; itemId: string; patientName: string }>({
    isOpen: false,
    itemId: '',
    patientName: '',
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    
    // Parse the date string - handles both ISO format and date-only strings
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC', // Use UTC to avoid timezone conversion issues
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Recife',
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

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { icon: LucideIcon; color: string; label: string; bgColor: string }> = {
      SENT: { icon: CheckCircle, color: 'text-green-500', label: 'Enviado', bgColor: 'bg-green-50' },
      DELIVERED: { icon: CheckCircle, color: 'text-green-600', label: 'Entregue', bgColor: 'bg-green-50' },
      READ: { icon: CheckCircle, color: 'text-blue-500', label: 'Lido', bgColor: 'bg-blue-50' },
      FAILED: { icon: XCircle, color: 'text-red-500', label: 'Falhou', bgColor: 'bg-red-50' },
      PENDING: { icon: Clock, color: 'text-gray-500', label: 'Pendente', bgColor: 'bg-gray-50' },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const getDispatchStatusInfo = (status: string) => {
    const statusMap: Record<string, { icon: LucideIcon; color: string; label: string; bgColor: string }> = {
      COMPLETED: { icon: CheckCircle, color: 'text-green-500', label: 'Concluído', bgColor: 'bg-green-100 text-green-800' },
      IN_PROGRESS: { icon: Loader2, color: 'text-blue-500', label: 'Em Andamento', bgColor: 'bg-blue-100 text-blue-800' },
      FAILED: { icon: XCircle, color: 'text-red-500', label: 'Falhou', bgColor: 'bg-red-100 text-red-800' },
      PENDING: { icon: Clock, color: 'text-gray-500', label: 'Pendente', bgColor: 'bg-gray-100 text-gray-800' },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const getSatisfactionLabel = (level: SatisfactionLevel) => {
    const labels: Record<SatisfactionLevel, string> = {
      NEUTRAL: 'Neutro',
      SATISFIED: 'Satisfeito',
      UNSATISFIED: 'Insatisfeito',
    };
    return labels[level];
  };

  const handleSatisfactionChange = (itemId: string, satisfactionLevel: SatisfactionLevel) => {
    updateSatisfaction.mutate({ itemId, satisfactionLevel });
  };

  const getSatisfactionColor = (level: SatisfactionLevel) => {
    const colors: Record<SatisfactionLevel, string> = {
      NEUTRAL: 'bg-gray-100 text-gray-700 border-gray-300',
      SATISFIED: 'bg-green-100 text-green-700 border-green-300',
      UNSATISFIED: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[level];
  };

  const getLeadStatusLabel = (status: LeadResponseStatus) => {
    const labels: Record<LeadResponseStatus, string> = {
      NO_RESPONSE: 'Não Respondeu',
      RESPONDED: 'Respondeu',
      INTERESTED: 'Demonstrou Interesse',
      NOT_INTERESTED: 'Sem Interesse',
      SCHEDULED: 'Agendou Consulta',
    };
    return labels[status];
  };

  const getLeadStatusColor = (status: LeadResponseStatus) => {
    const colors: Record<LeadResponseStatus, string> = {
      NO_RESPONSE: 'bg-gray-100 text-gray-700 border-gray-300',
      RESPONDED: 'bg-green-100 text-green-700 border-green-300',
      INTERESTED: 'bg-blue-100 text-blue-700 border-blue-300',
      NOT_INTERESTED: 'bg-red-100 text-red-700 border-red-300',
      SCHEDULED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    };
    return colors[status];
  };

  const handleLeadStatusChange = (itemId: string, leadStatus: LeadResponseStatus) => {
    updateLeadStatus.mutate({ itemId, leadStatus });
  };

  if (isLoading) {
    return (
      <PrivateLayout
        title="Detalhes do Disparo"
        description="Carregando informações..."
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Carregando detalhes do disparo...</p>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  if (error || !dispatch) {
    return (
      <PrivateLayout
        title="Detalhes do Disparo"
        description="Erro ao carregar"
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Erro ao carregar detalhes do disparo</p>
            <button
              onClick={() => router.push('/after-sales')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  const statusInfo = getDispatchStatusInfo(dispatch.status);
  const StatusIcon = statusInfo.icon;

  return (
    <PrivateLayout
      title="Detalhes do Disparo"
      description={`Visualize os detalhes e pacientes contatados neste disparo`}
    >
      <div className="flex flex-col gap-6">
        {/* Botão Voltar */}
        <button
          onClick={() => router.push('/after-sales')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar para Pós-Venda</span>
        </button>

        {/* Informações Gerais do Disparo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Informações do Disparo</h2>
            <div className={cn('px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2', statusInfo.bgColor)}>
              <StatusIcon className={cn('w-4 h-4', statusInfo.color, dispatch.status === 'IN_PROGRESS' && 'animate-spin')} />
              {statusInfo.label}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Data do Disparo</p>
                <p className="text-base font-semibold text-gray-900">{formatDate(dispatch.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cadência</p>
                <p className="text-base font-semibold text-gray-900">{getCadenceLabel(dispatch.cadence)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total de Pacientes</p>
                <p className="text-base font-semibold text-gray-900">{dispatch.totalPatients}</p>
              </div>
            </div>
          </div>

          {/* Métricas de Sucesso */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700 mb-1">Mensagens Enviadas</p>
                <p className="text-2xl font-bold text-green-900">{dispatch.successCount}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700 mb-1">Falhas</p>
                <p className="text-2xl font-bold text-red-900">{dispatch.errorCount}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-blue-900">{dispatch.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          {(dispatch.startedAt || dispatch.completedAt) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {dispatch.startedAt && (
                  <div>
                    <span className="text-gray-500">Iniciado em: </span>
                    <span className="font-medium text-gray-900">{formatDateTime(dispatch.startedAt)}</span>
                  </div>
                )}
                {dispatch.completedAt && (
                  <div>
                    <span className="text-gray-500">Concluído em: </span>
                    <span className="font-medium text-gray-900">{formatDateTime(dispatch.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Lista de Pacientes Contatados */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Pacientes Contatados ({dispatch.items?.length || 0})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Lista detalhada de todos os pacientes incluídos neste disparo
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status do Lead
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nível de Satisfação
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enviado em
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dispatch.items && dispatch.items.length > 0 ? (
                  dispatch.items.map((item) => {
                    const itemStatusInfo = getStatusInfo(item.status);
                    const ItemStatusIcon = itemStatusInfo.icon;

                    return (
                      <tr 
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.patient.fullName}
                              </p>
                              {item.errorMessage && (
                                <p className="text-xs text-red-600 mt-1 truncate">
                                  {item.errorMessage}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="truncate">{item.phoneNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', itemStatusInfo.bgColor)}>
                            <ItemStatusIcon className={cn('w-3 h-3 mr-1 flex-shrink-0', itemStatusInfo.color)} />
                            <span className="truncate">{itemStatusInfo.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={item.leadStatus}
                            onValueChange={(value) => handleLeadStatusChange(item.id, value as LeadResponseStatus)}
                          >
                            <SelectTrigger className={cn("w-full max-w-[160px] h-8 text-xs border-2", getLeadStatusColor(item.leadStatus))}>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NO_RESPONSE" className="text-xs">
                                ⚪ Não Respondeu
                              </SelectItem>
                              <SelectItem value="RESPONDED" className="text-xs">
                                🟢 Respondeu
                              </SelectItem>
                              <SelectItem value="INTERESTED" className="text-xs">
                                🔵 Demonstrou Interesse
                              </SelectItem>
                              <SelectItem value="NOT_INTERESTED" className="text-xs">
                                🔴 Sem Interesse
                              </SelectItem>
                              <SelectItem value="SCHEDULED" className="text-xs">
                                💚 Agendou Consulta
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={item.satisfactionLevel}
                            onValueChange={(value) => handleSatisfactionChange(item.id, value as SatisfactionLevel)}
                          >
                            <SelectTrigger className={cn("w-full max-w-[120px] h-8 text-xs border-2", getSatisfactionColor(item.satisfactionLevel))}>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NEUTRAL" className="text-xs">
                                😐 Neutro
                              </SelectItem>
                              <SelectItem value="SATISFIED" className="text-xs">
                                😊 Satisfeito
                              </SelectItem>
                              <SelectItem value="UNSATISFIED" className="text-xs">
                                😞 Insatisfeito
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                          {formatDateTime(item.sentAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                            onClick={() => setNotesModalState({ isOpen: true, itemId: item.id, patientName: item.patient.fullName })}
                          >
                            <MessageSquare className="w-4 h-4" />
                            Ver
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            className="text-gray-600 hover:text-blue-600 text-xs font-medium flex items-center gap-1 hover:underline"
                            onClick={() => router.push(`/patient/${item.patient.id}`)}
                          >
                            <User className="w-4 h-4" />
                            Detalhes
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhum paciente encontrado neste disparo</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Modal */}
        <DispatchNotesModal
          itemId={notesModalState.itemId}
          patientName={notesModalState.patientName}
          isOpen={notesModalState.isOpen}
          onClose={() => setNotesModalState({ isOpen: false, itemId: '', patientName: '' })}
        />
      </div>
    </PrivateLayout>
  );
};

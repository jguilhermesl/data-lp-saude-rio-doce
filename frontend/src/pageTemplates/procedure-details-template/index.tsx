'use client';
import { PrivateLayout } from '@/components/private-layout';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  DollarSign,
  Activity,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface ProcedureDetailsTemplateProps {
  procedureId: string;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime?: string;
  examValue?: number;
  paidValue?: number;
  paymentDone: boolean;
  insuranceName?: string;
  patient: {
    id: string;
    fullName: string;
    cpf?: string;
  } | null;
  doctor: {
    id: string;
    name: string;
    crm?: string;
  } | null;
}

interface ProcedureData {
  procedure: {
    id: string;
    name: string;
    code?: string;
    defaultPrice?: number;
  };
  metrics: {
    totalRevenue: number;
    totalAppointments: number;
    averageTicket: number;
  };
  appointments: Appointment[];
  period: {
    startDate: string | null;
    endDate: string | null;
  };
}

export const ProcedureDetailsTemplate = ({
  procedureId,
}: ProcedureDetailsTemplateProps) => {
  const router = useRouter();
  const [data, setData] = useState<ProcedureData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Set default dates to current month
  const now = new Date();
  const defaultStartDate = format(startOfMonth(now), 'yyyy-MM-dd');
  const defaultEndDate = format(endOfMonth(now), 'yyyy-MM-dd');
  
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProcedureData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/procedures/${procedureId}${params.toString() ? `?${params.toString()}` : ''}`);
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching procedure data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedureData();
  }, [procedureId]);

  const handleApplyFilters = () => {
    fetchProcedureData();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <PrivateLayout
        title="Detalhes do Procedimento"
        description="Carregando..."
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>
      </PrivateLayout>
    );
  }

  if (!data) {
    return (
      <PrivateLayout
        title="Detalhes do Procedimento"
        description="Procedimento não encontrado"
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Procedimento não encontrado</p>
          <Button onClick={() => router.push('/procedures')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de procedimentos
          </Button>
        </div>
      </PrivateLayout>
    );
  }

  const { procedure, metrics, appointments } = data;

  return (
    <PrivateLayout
      title={procedure.name}
      description={procedure.code ? `Código: ${procedure.code}` : 'Procedimento'}
    >
      <div className="flex flex-col gap-6">
        {/* Header with Back Button and Filters */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/procedures')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Filtrar por Período
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Data Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters}>
                Aplicar Filtros
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Faturamento Total
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(metrics.totalRevenue)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Total de Atendimentos
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {metrics.totalAppointments}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Ticket Médio
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(metrics.averageTicket)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Procedure Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informações do Procedimento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Nome do Procedimento
              </label>
              <p className="text-base text-gray-900 mt-1">{procedure.name}</p>
            </div>
            {procedure.code && (
              <div>
                <label className="text-sm font-medium text-gray-500">Código</label>
                <p className="text-base text-gray-900 mt-1">{procedure.code}</p>
              </div>
            )}
            {procedure.defaultPrice && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Preço Padrão
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(Number(procedure.defaultPrice))}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Últimos Atendimentos do Procedimento ({appointments.length})
          </h3>
          {appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Paciente
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Médico
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Convênio
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Valor Pago
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {appointment.patient?.fullName || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {appointment.doctor?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(appointment.appointmentDate).toLocaleDateString('pt-BR')}
                        {appointment.appointmentTime && ` ${appointment.appointmentTime}`}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {appointment.insuranceName || 'Particular'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">
                        {appointment.paidValue
                          ? new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(Number(appointment.paidValue))
                          : 'R$ 0,00'}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.paymentDone
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {appointment.paymentDone ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhum atendimento encontrado no período selecionado
            </p>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
};

'use client';
import { PrivateLayout } from '@/components/private-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, Users, TrendingUp, Calendar, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentsList } from './appointments-list';

interface DoctorDetailsTemplateProps {
  doctorId: string;
}

interface Procedure {
  id: string;
  name: string;
  code?: string;
  quantity?: number;
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
  procedures: Procedure[];
}

interface ProcedureStats {
  name: string;
  code?: string;
  count: number;
  revenue: number;
}

interface DoctorData {
  doctor: {
    id: string;
    name: string;
    crm?: string;
    homePhone?: string;
    workPhone?: string;
    mobilePhone?: string;
    specialties: Array<{
      id: string;
      name: string;
    }>;
  };
  metrics: {
    totalRevenue: number;
    totalAppointments: number;
    averageTicket: number;
  };
  appointments: Appointment[];
  proceduresByRevenue: ProcedureStats[];
  period: {
    startDate: string | null;
    endDate: string | null;
  };
}

export const DoctorDetailsTemplate = ({
  doctorId,
}: DoctorDetailsTemplateProps) => {
  const router = useRouter();
  const [data, setData] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Set default dates to current month
  const now = new Date();
  const defaultStartDate = format(startOfMonth(now), 'yyyy-MM-dd');
  const defaultEndDate = format(endOfMonth(now), 'yyyy-MM-dd');
  
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [showFilters, setShowFilters] = useState(false);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/doctors/${doctorId}${params.toString() ? `?${params.toString()}` : ''}`);
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [doctorId]);

  const handleApplyFilters = () => {
    fetchDoctorData();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <PrivateLayout title="Detalhes do Médico" description="Carregando...">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>
      </PrivateLayout>
    );
  }

  if (!data) {
    return (
      <PrivateLayout
        title="Detalhes do Médico"
        description="Médico não encontrado"
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Médico não encontrado</p>
          <Button onClick={() => router.push('/doctors')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de médicos
          </Button>
        </div>
      </PrivateLayout>
    );
  }

  const { doctor, metrics, appointments, proceduresByRevenue } = data;

  return (
    <PrivateLayout
      title={doctor.name}
      description={`${doctor.crm || 'CRM não informado'} - ${doctor.specialties.map(s => s.name).join(', ')}`}
    >
      <div className="flex flex-col gap-6">
        {/* Header with Back Button and Filters */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/doctors')}
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
                <Users className="h-6 w-6 text-blue-600" />
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

        {/* Doctor Information and Top Procedures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doctor Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações do Médico
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Nome Completo
                </label>
                <p className="text-base text-gray-900 mt-1">{doctor.name}</p>
              </div>
              {doctor.crm && (
                <div>
                  <label className="text-sm font-medium text-gray-500">CRM</label>
                  <p className="text-base text-gray-900 mt-1">{doctor.crm}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Especialidades
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {doctor.specialties.map((specialty) => (
                    <span
                      key={specialty.id}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {specialty.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Procedures */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Procedimentos x Atendimentos x Faturamento
            </h3>
            <div className="space-y-4">
              {proceduresByRevenue.length > 0 ? (
                proceduresByRevenue.slice(0, 5).map((procedure, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-8 w-8 bg-gray-200 rounded-full text-sm font-semibold text-gray-700">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {procedure.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {procedure.count} atendimento{procedure.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(procedure.revenue)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhum procedimento encontrado no período
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Atendimentos do Período ({appointments.length})
          </h3>
          <AppointmentsList appointments={appointments} isLoading={loading} />
        </div>
      </div>
    </PrivateLayout>
  );
};

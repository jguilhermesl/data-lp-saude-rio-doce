'use client';
import { PrivateLayout } from '@/components/private-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePatientById } from '@/hooks/usePatientById';
import { AppointmentsList } from './appointments-list';

interface PatientDetailsTemplateProps {
  patientId: string;
}

export const PatientDetailsTemplate = ({
  patientId,
}: PatientDetailsTemplateProps) => {
  const router = useRouter();
  const { data: patient, isLoading } = usePatientById(patientId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    // Extract date directly from ISO string without timezone conversion
    const [year, month, day] = date.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
    return (
      <PrivateLayout title="Detalhes do Paciente" description="Carregando...">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>
      </PrivateLayout>
    );
  }

  if (!patient) {
    return (
      <PrivateLayout
        title="Detalhes do Paciente"
        description="Paciente não encontrado"
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Paciente não encontrado</p>
          <Button onClick={() => router.push('/patient')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de pacientes
          </Button>
        </div>
      </PrivateLayout>
    );
  }

  const lastAppointment = patient.appointments.length > 0 
    ? patient.appointments[0] 
    : null;

  return (
    <PrivateLayout 
      title={patient.fullName} 
      description={`${patient.cpf ? `CPF: ${patient.cpf}` : 'CPF não informado'}`}
    >
      <div className="flex flex-col gap-6">
        {/* Back Button */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/patient')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Total de Atendimentos
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {patient.metrics.appointmentCount}
                </p>
                {lastAppointment && (
                  <p className="text-xs text-gray-500 mt-1">
                    Último: {formatDate(lastAppointment.appointmentDate)}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Total Gasto
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(patient.metrics.totalSpent)}
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
                  Ticket Médio
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(patient.metrics.averageTicket)}
                </p>
                {patient.metrics.pendingAmount > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Pendente: {formatCurrency(patient.metrics.pendingAmount)}
                  </p>
                )}
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Informações do Paciente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Nome Completo
              </label>
              <p className="text-base text-gray-900 mt-1">{patient.fullName}</p>
            </div>
            {patient.cpf && (
              <div>
                <label className="text-sm font-medium text-gray-500">CPF</label>
                <p className="text-base text-gray-900 mt-1">{patient.cpf}</p>
              </div>
            )}
            {patient.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Telefone</label>
                <p className="text-base text-gray-900 mt-1">{patient.phone}</p>
              </div>
            )}
            {patient.email && (
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base text-gray-900 mt-1">{patient.email}</p>
              </div>
            )}
            {patient.birthDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                <p className="text-base text-gray-900 mt-1">{formatDate(patient.birthDate)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Histórico de Atendimentos ({patient.appointments.length})
          </h3>
          <AppointmentsList 
            appointments={patient.appointments} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </PrivateLayout>
  );
};

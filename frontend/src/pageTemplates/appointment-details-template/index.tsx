'use client';
import { PrivateLayout } from '@/components/private-layout';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  User,
  Stethoscope,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppointmentById } from '@/hooks/useAppointmentById';

interface AppointmentDetailsTemplateProps {
  appointmentId: string;
}

export const AppointmentDetailsTemplate = ({
  appointmentId,
}: AppointmentDetailsTemplateProps) => {
  const router = useRouter();
  const { data: appointment, isLoading, error } = useAppointmentById(appointmentId);

  // Debug logs
  console.log('AppointmentId:', appointmentId);
  console.log('Loading:', isLoading);
  console.log('Error:', error);
  console.log('Appointment:', appointment);

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'R$ 0,00';
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
      <PrivateLayout
        title="Detalhes do Atendimento"
        description="Carregando..."
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>
      </PrivateLayout>
    );
  }

  if (error || !appointment) {
    return (
      <PrivateLayout
        title="Detalhes do Atendimento"
        description="Atendimento não encontrado"
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">
            {error ? 'Erro ao carregar o atendimento' : 'Atendimento não encontrado'}
          </p>
          <Button onClick={() => router.push('/appointments')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de atendimentos
          </Button>
        </div>
      </PrivateLayout>
    );
  }

  const balance = (appointment.examValue || 0) - (appointment.paidValue || 0);
  const isFullyPaid = balance === 0;

  return (
    <PrivateLayout
      title={`Atendimento #${appointment.externalId}`}
      description={`${appointment.patient?.fullName || 'N/A'} - ${formatDate(appointment.appointmentDate)}`}
    >
      <div className="flex flex-col gap-6">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/appointments')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          {isFullyPaid ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              PAGO
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              PENDENTE
            </span>
          )}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Valor Pago
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(appointment.paidValue)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações do Atendimento */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informações do Atendimento
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Código do Atendimento
                </label>
                <p className="text-base text-gray-900 mt-1 font-mono">
                  #{appointment.externalId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Data do Atendimento
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {formatDate(appointment.appointmentDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Hora do Atendimento
                </label>
                <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {appointment.appointmentTime || 'Não informado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Convênio
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {appointment.insuranceName || 'Particular'}
                </p>
              </div>
              {appointment.specialty && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Especialidade
                  </label>
                  <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    {appointment.specialty.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Paciente e Médico */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Paciente e Médico
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Paciente
                </label>
                <p className="text-base text-gray-900 mt-1 font-medium">
                  {appointment.patient?.fullName || 'N/A'}
                </p>
                {appointment.patient?.cpf && (
                  <p className="text-sm text-gray-600 mt-1">
                    CPF: {appointment.patient.cpf}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Médico Responsável
                </label>
                <p className="text-base text-gray-900 mt-1 font-medium">
                  {appointment.doctor?.name || 'N/A'}
                </p>
                {appointment.doctor?.crm && (
                  <p className="text-sm text-gray-600 mt-1">
                    CRM: {appointment.doctor.crm}
                  </p>
                )}
              </div>
              {appointment.responsibleUser && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Usuário Responsável
                  </label>
                  <p className="text-base text-gray-900 mt-1">
                    {appointment.responsibleUser.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {appointment.responsibleUser.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Procedimentos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Procedimentos/Exames
          </h3>
          <div className="space-y-3">
            {appointment.appointmentProcedures && appointment.appointmentProcedures.length > 0 ? (
              appointment.appointmentProcedures.map((ap) => (
                <div
                  key={ap.id}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-base text-gray-900 font-medium">
                        {ap.procedure.name}
                      </p>
                      {ap.procedure.code && (
                        <p className="text-sm text-gray-600 mt-1">
                          Código: {ap.procedure.code}
                        </p>
                      )}
                    </div>
                    {ap.procedure.defaultPrice && (
                      <p className="text-sm text-gray-900 font-medium">
                        {formatCurrency(ap.procedure.defaultPrice)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-base text-gray-600">
                  {appointment.examsRaw || 'Nenhum procedimento específico registrado'}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </PrivateLayout>
  );
};

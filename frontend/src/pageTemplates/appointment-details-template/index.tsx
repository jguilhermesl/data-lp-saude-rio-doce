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
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AppointmentDetailsTemplateProps {
  appointmentId: string;
}

interface AppointmentDetails {
  hii_cod_atendimento: string;
  cod_atendimento: string;
  hid_status: string;
  status: string;
  status_obs: string;
  txt_usuario_responsavel: string;
  paciente: string;
  medico: string;
  dat_atendimento: string;
  hora_atendimento: string;
  dat_criacao: string;
  convenio: string;
  vlr_exames: string;
  vlr_pago: string;
  exames: string;
  pagamentos_realizados: string;
  statusAtend: string;
}

export const AppointmentDetailsTemplate = ({
  appointmentId,
}: AppointmentDetailsTemplateProps) => {
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API call
    // Example: fetch(`/api/appointments/${appointmentId}`).then(res => res.json())

    // Mock data for demonstration
    setTimeout(() => {
      setAppointment({
        hii_cod_atendimento: appointmentId,
        cod_atendimento: appointmentId,
        hid_status: 'F',
        status: 'F',
        status_obs: 'NAO DESTACAR',
        txt_usuario_responsavel: 'PATRICIA OLIVEIRA',
        paciente: 'LINDACI RAMOS DE BRITO',
        medico: 'ANDRE FELIPE DA SILVA MACEDO',
        dat_atendimento: '03/12/2025',
        hora_atendimento: '13:48:51',
        dat_criacao: '03/12/2025',
        convenio: 'PARTICULAR',
        vlr_exames: '140.00',
        vlr_pago: '140.00',
        exames: 'CONSULTA CARDIOLOGISTA',
        pagamentos_realizados: 'CARTAO DEBITO (140.00)',
        statusAtend:
          '<span class="btn btn-success btn-sm"><strong>FECHADO</strong></span>',
      });
      setLoading(false);
    }, 500);
  }, [appointmentId]);

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'F':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            FECHADO
          </span>
        );
      case 'A':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            ABERTO
          </span>
        );
      case 'C':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            CANCELADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
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

  if (!appointment) {
    return (
      <PrivateLayout
        title="Detalhes do Atendimento"
        description="Atendimento não encontrado"
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Atendimento não encontrado</p>
          <Button onClick={() => router.push('/appointments')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista de atendimentos
          </Button>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout
      title={`Atendimento #${appointment.cod_atendimento}`}
      description={`${appointment.paciente} - ${appointment.dat_atendimento}`}
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
          {getStatusBadge(appointment.status)}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Valor dos Exames
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(appointment.vlr_exames)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">
                  Valor Pago
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(appointment.vlr_pago)}
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
                  Saldo Devedor
                </h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(
                    (
                      parseFloat(appointment.vlr_exames) -
                      parseFloat(appointment.vlr_pago)
                    ).toFixed(2)
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
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
                  #{appointment.cod_atendimento}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Data do Atendimento
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {appointment.dat_atendimento}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Hora do Atendimento
                </label>
                <p className="text-base text-gray-900 mt-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {appointment.hora_atendimento}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Data de Criação
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {appointment.dat_criacao}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Convênio
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {appointment.convenio}
                </p>
              </div>
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
                  {appointment.paciente}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Médico Responsável
                </label>
                <p className="text-base text-gray-900 mt-1 font-medium">
                  {appointment.medico}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Usuário Responsável
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {appointment.txt_usuario_responsavel}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Observação de Status
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {appointment.status_obs}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Procedimentos e Pagamentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Procedimentos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Procedimentos/Exames
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-base text-gray-900 font-medium">
                  {appointment.exames}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Valor: {formatCurrency(appointment.vlr_exames)}
                </p>
              </div>
            </div>
          </div>

          {/* Pagamentos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Formas de Pagamento
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-base text-gray-900 font-medium">
                  {appointment.pagamentos_realizados}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Total Pago: {formatCurrency(appointment.vlr_pago)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

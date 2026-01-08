'use client';

import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AppointmentsTableRowProps {
  appointment: {
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
  };
}

export const AppointmentsTableRow = ({
  appointment,
}: AppointmentsTableRowProps) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/appointments/${appointment.cod_atendimento}`);
  };

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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            FECHADO
          </span>
        );
      case 'A':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ABERTO
          </span>
        );
      case 'C':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            CANCELADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <Table.Row>
      {/* Data */}
      <Table.Col className="font-medium whitespace-nowrap">
        {appointment.dat_atendimento}
      </Table.Col>

      {/* Hora */}
      <Table.Col className="font-medium whitespace-nowrap">
        {appointment.hora_atendimento}
      </Table.Col>

      {/* Paciente */}
      <Table.Col className="font-medium">{appointment.paciente}</Table.Col>

      {/* Médico */}
      <Table.Col className="font-medium">{appointment.medico}</Table.Col>

      {/* Especialidade (exames) */}
      <Table.Col className="font-medium">{appointment.exames}</Table.Col>

      {/* Convênio */}
      <Table.Col className="font-medium">{appointment.convenio}</Table.Col>

      {/* Procedimento(s) (exames) */}
      <Table.Col className="font-medium">{appointment.exames}</Table.Col>

      {/* Valor dos Exames */}
      <Table.Col className="font-medium whitespace-nowrap">
        {formatCurrency(appointment.vlr_exames)}
      </Table.Col>

      {/* Valor Pago */}
      <Table.Col className="font-medium whitespace-nowrap">
        {formatCurrency(appointment.vlr_pago)}
      </Table.Col>

      {/* Forma(s) de Pagamento */}
      <Table.Col className="font-medium">
        {appointment.pagamentos_realizados}
      </Table.Col>

      {/* Usuário Responsável */}
      <Table.Col className="font-medium">
        {appointment.txt_usuario_responsavel}
      </Table.Col>

      {/* Status */}
      <Table.Col className="font-medium">
        {getStatusBadge(appointment.status)}
      </Table.Col>

      {/* Ações */}
      <Table.Col>
        <Button variant="ghost" size="sm" onClick={handleViewDetails}>
          <Eye className="mr-2 h-3 w-3" />
          Ver detalhes
        </Button>
      </Table.Col>
    </Table.Row>
  );
};

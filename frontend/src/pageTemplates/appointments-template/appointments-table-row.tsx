'use client';

import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
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
    <TableRow>
      {/* Data */}
      <TableCell className="font-medium whitespace-nowrap">
        {appointment.dat_atendimento}
      </TableCell>

      {/* Hora */}
      <TableCell className="font-medium whitespace-nowrap">
        {appointment.hora_atendimento}
      </TableCell>

      {/* Paciente */}
      <TableCell className="font-medium">{appointment.paciente}</TableCell>

      {/* Médico */}
      <TableCell className="font-medium">{appointment.medico}</TableCell>

      {/* Especialidade (exames) */}
      <TableCell className="font-medium">{appointment.exames}</TableCell>

      {/* Convênio */}
      <TableCell className="font-medium">{appointment.convenio}</TableCell>

      {/* Procedimento(s) (exames) */}
      <TableCell className="font-medium">{appointment.exames}</TableCell>

      {/* Valor dos Exames */}
      <TableCell className="font-medium whitespace-nowrap">
        {formatCurrency(appointment.vlr_exames)}
      </TableCell>

      {/* Valor Pago */}
      <TableCell className="font-medium whitespace-nowrap">
        {formatCurrency(appointment.vlr_pago)}
      </TableCell>

      {/* Forma(s) de Pagamento */}
      <TableCell className="font-medium">
        {appointment.pagamentos_realizados}
      </TableCell>

      {/* Usuário Responsável */}
      <TableCell className="font-medium">
        {appointment.txt_usuario_responsavel}
      </TableCell>

      {/* Status */}
      <TableCell className="font-medium">
        {getStatusBadge(appointment.status)}
      </TableCell>

      {/* Ações */}
      <TableCell>
        <Button variant="ghost" size="sm" onClick={handleViewDetails}>
          <Eye className="mr-2 h-3 w-3" />
          Ver detalhes
        </Button>
      </TableCell>
    </TableRow>
  );
};

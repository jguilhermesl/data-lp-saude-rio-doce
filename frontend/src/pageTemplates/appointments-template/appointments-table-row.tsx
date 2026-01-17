'use client';

import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Appointment } from '@/services/api/appointments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentsTableRowProps {
  appointment: Appointment;
}

export const AppointmentsTableRow = ({
  appointment,
}: AppointmentsTableRowProps) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/appointments/${appointment.id}`);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <Table.Row>
      {/* Data */}
      <Table.Col className="font-medium whitespace-nowrap">
        {formatDate(appointment.appointmentDate)}
      </Table.Col>

      {/* Hora */}
      <Table.Col className="font-medium whitespace-nowrap">
        {appointment.appointmentTime || '-'}
      </Table.Col>
      
      {/* Procedimento(s) */}
      <Table.Col className="font-medium max-w-[250px]">
        <div className="truncate" title={appointment.examsRaw || 'N/A'}>
          {appointment.examsRaw || 'N/A'}
        </div>
      </Table.Col>

      {/* Paciente */}
      <Table.Col className="font-medium">
        {appointment.patient?.fullName || 'N/A'}
      </Table.Col>

      {/* Médico */}
      <Table.Col className="font-medium">
        {appointment.doctor?.name || 'N/A'}
      </Table.Col>

      {/* Convênio */}
      <Table.Col className="font-medium">
        {appointment.insuranceName || 'Particular'}
      </Table.Col>



      {/* Valor Pago */}
      <Table.Col className="font-medium whitespace-nowrap">
        {formatCurrency(appointment.paidValue)}
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

'use client';
import { Table } from '@/components/ui/table/table';

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
  examsRaw?: string
}

interface AppointmentsTableRowProps {
  appointment: Appointment;
}

export const AppointmentsTableRow = ({ appointment }: AppointmentsTableRowProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Table.Row>
      <Table.Col>
        <div className="flex flex-col">
          <span className="font-medium">
            {(() => {
              const [year, month, day] = appointment.appointmentDate.split('T')[0].split('-');
              return `${day}/${month}/${year}`;
            })()}
          </span>
          {appointment.appointmentTime && (
            <span className="text-xs text-gray-500">
              {appointment.appointmentTime}
            </span>
          )}
        </div>
      </Table.Col>
      <Table.Col>
        {appointment.patient?.fullName || 'Paciente não informado'}
      </Table.Col>
      <Table.Col>
        {appointment.examsRaw ? (
          <div className="space-y-1">
            {appointment.examsRaw}
          </div>
        ) : (
          <span className="text-gray-500">Não informado</span>
        )}
      </Table.Col>
      <Table.Col>
        {appointment.insuranceName || '-'}
      </Table.Col>
      <Table.Col className="text-right font-medium">
        {appointment.paidValue
          ? formatCurrency(Number(appointment.paidValue))
          : '-'}
      </Table.Col>
      <Table.Col className="text-center">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            appointment.paymentDone
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {appointment.paymentDone ? 'Pago' : 'Pendente'}
        </span>
      </Table.Col>
    </Table.Row>
  );
};

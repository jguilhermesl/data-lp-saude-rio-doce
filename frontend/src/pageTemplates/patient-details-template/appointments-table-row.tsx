'use client';
import { Table } from '@/components/ui/table/table';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime?: string;
  examValue?: number;
  paidValue?: number;
  paymentDone: boolean;
  insuranceName?: string;
  doctor: {
    id: string;
    name: string;
    crm?: string;
  } | null;
  specialty: {
    id: string;
    name: string;
  } | null;
  appointmentProcedures: Array<{
    procedure: {
      id: string;
      name: string;
      code?: string;
    };
  }>;
}

interface AppointmentsTableRowProps {
  appointment: Appointment;
}

export const AppointmentsTableRow = ({ appointment }: AppointmentsTableRowProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/appointments/${appointment.id}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const procedures = appointment.appointmentProcedures
    .map(ap => ap.procedure.name)
    .join(', ');

  return (
    <Table.Row onClick={handleClick}>
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
        <div className="flex flex-col">
          <span className="font-medium">
            {appointment.doctor?.name || 'Não informado'}
          </span>
          {appointment.doctor?.crm && (
            <span className="text-xs text-gray-500">
              CRM: {appointment.doctor.crm}
            </span>
          )}
        </div>
      </Table.Col>
      <Table.Col>
        <div className="max-w-[200px] truncate" title={procedures}>
          {procedures || <span className="text-gray-500">Não informado</span>}
        </div>
      </Table.Col>
      <Table.Col className="font-medium text-green-600">
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

import { Table } from '@/components/ui/table/table';
import { Calendar } from 'lucide-react';
import { AppointmentsTableRow } from './appointments-table-row';
import { Appointment } from '@/@types/Appointment';

interface AppointmentsListProps {
  appointments: Appointment[];
  isLoading: boolean;
}

export const AppointmentsList = ({ appointments, isLoading }: AppointmentsListProps) => {
  const headers = [
    'Data',
    'Médico',
    'Procedimentos',
    'Valor Pago',
    'Status',
  ];

  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table headers={headers}>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b animate-pulse">
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Nenhum atendimento encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border rounded-md">
        <Table headers={headers}>
          {appointments.map((appointment) => (
            <AppointmentsTableRow key={appointment.id} appointment={appointment} />
          ))}
        </Table>
      </div>
    </div>
  );
};

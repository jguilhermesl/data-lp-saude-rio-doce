import { Table } from '@/components/ui/table/table';
import { DoctorsTableRow } from './doctors-table-row';
import { DoctorMetrics } from '@/services/api/doctors';

interface DoctorsListProps {
  doctors: DoctorMetrics[];
  isLoading: boolean;
}

export const DoctorsList = ({ doctors, isLoading }: DoctorsListProps) => {
  const headers = [
    'Médico',
    'Especialidade',
    'Faturamento',
    'Atendimentos',
    'Ticket médio',
    '',
  ];

  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table headers={headers}>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b animate-pulse">
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </td>
              <td className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center">
        <p className="text-gray-500">Nenhum médico encontrado no período.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border rounded-md">
        <Table headers={headers}>
          {doctors.map((doctor) => {
            return <DoctorsTableRow key={doctor.doctorId} doctor={doctor} />;
          })}
        </Table>
      </div>
    </div>
  );
};

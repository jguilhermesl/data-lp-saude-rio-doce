import { Table } from '@/components/ui/table/table';
import { DoctorsTableRow } from './doctors-table-row';

export const DoctorsList = () => {
  // TODO: Replace with real API data
  const mockDoctors = Array.from({ length: 10 }).map((_, i) => ({
    id: `doctor-${i + 1}`,
    externalId: `0321cjlas3921${i}`,
    name: `Médico ${i + 1}`,
    status: 'Ativo',
    revenue: 49900 + i * 1000,
  }));

  const headers = [
    'Médico',
    'Especialidade',
    'Faturamento',
    'Atendimentos',
    'Ticket médio',
    '',
  ];

  return (
    <div>
      <div className="border rounded-md">
        <Table headers={headers}>
          {mockDoctors.map((doctor) => {
            return <DoctorsTableRow key={doctor.id} doctor={doctor} />;
          })}
        </Table>
      </div>
    </div>
  );
};

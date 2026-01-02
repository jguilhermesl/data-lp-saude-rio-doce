import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  return (
    <div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identificador</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Faturamento</TableHead>
              <TableHead> Atendimentos</TableHead>
              <TableHead> Ticket médio </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockDoctors.map((doctor) => {
              return <DoctorsTableRow key={doctor.id} doctor={doctor} />;
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

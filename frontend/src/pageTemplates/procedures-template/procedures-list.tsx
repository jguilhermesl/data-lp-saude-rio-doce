import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProceduresTableRow } from './procedures-table-row';

export const ProceduresList = () => {
  // TODO: Replace with real API data
  const mockProcedures = Array.from({ length: 10 }).map((_, i) => ({
    id: `procedure-${i + 1}`,
    name: `Procedimento ${i + 1}`,
    specialty:
      i % 3 === 0 ? 'Cardiologia' : i % 3 === 1 ? 'Ortopedia' : 'Clínica Geral',
    revenue: 45000 + i * 2000,
    appointments: 120 + i * 15,
    averageTicket: (45000 + i * 2000) / (120 + i * 15),
  }));

  return (
    <div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do procedimento</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Faturamento total</TableHead>
              <TableHead>Nº de atendimentos</TableHead>
              <TableHead>Ticket médio</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockProcedures.map((procedure) => {
              return (
                <ProceduresTableRow key={procedure.id} procedure={procedure} />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

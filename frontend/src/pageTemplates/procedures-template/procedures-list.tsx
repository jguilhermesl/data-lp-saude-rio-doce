import { Table } from '@/components/ui/table/table';
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

  const headers = [
    'Nome do procedimento',
    'Especialidade',
    'Faturamento total',
    'Nº de atendimentos',
    'Ticket médio',
    '',
  ];

  return (
    <div>
      <div className="border rounded-md">
        <Table headers={headers}>
          {mockProcedures.map((procedure) => {
            return (
              <ProceduresTableRow key={procedure.id} procedure={procedure} />
            );
          })}
        </Table>
      </div>
    </div>
  );
};

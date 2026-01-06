import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PatientsTableRow } from './patients-table-row';

export const PatientsList = () => {
  // TODO: Replace with real API data
  const mockPatients = Array.from({ length: 10 }).map((_, i) => ({
    id: `patient-${i + 1}`,
    name: `Paciente ${i + 1}`,
    cpf: `${String(100 + i).padStart(3, '0')}.${String(200 + i).padStart(
      3,
      '0'
    )}.${String(300 + i).padStart(3, '0')}-${String(10 + i).padStart(2, '0')}`,
    lpBenefitsStatus: i % 2 === 0 ? 'Ativo' : 'Inativo',
    totalSpent: 5000 + i * 500,
    appointmentsCount: 10 + i * 2,
    lastAppointmentDate: new Date(2025, 0, 15 - i),
  }));

  return (
    <div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do paciente</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>LP Benefícios</TableHead>
              <TableHead>Total gasto no período</TableHead>
              <TableHead>Número de atendimentos</TableHead>
              <TableHead>Data do último atendimento</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPatients.map((patient) => {
              return <PatientsTableRow key={patient.id} patient={patient} />;
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

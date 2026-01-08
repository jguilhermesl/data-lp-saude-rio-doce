import { Table } from '@/components/ui/table';
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

  const headers = [
    'Nome do paciente',
    'CPF',
    'LP Benefícios',
    'Total gasto no período',
    'Número de atendimentos',
    'Data do último atendimento',
    'Ações',
  ];

  return (
    <div>
      <div className="border rounded-md">
        <Table headers={headers}>
          {mockPatients.map((patient) => {
            return <PatientsTableRow key={patient.id} patient={patient} />;
          })}
        </Table>
      </div>
    </div>
  );
};

import { PatientsList } from './patients-list';
import { PatientsTableFilters } from './patients-table-filter';
import { PrivateLayout } from '@/components/private-layout';

export const PatientsTemplate = () => {
  return (
    <PrivateLayout
      title="Pacientes"
      description="Visualize e gerencie seus pacientes"
    >
      <div className="flex flex-col gap-4">
        <PatientsTableFilters />
        <PatientsList />
      </div>
    </PrivateLayout>
  );
};

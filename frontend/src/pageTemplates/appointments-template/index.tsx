import { AppointmentsMetricCards } from './appointments-metric-cards';
import { AppointmentsTableFilters } from './appointments-table-filter';
import { AppointmentsList } from './appointments-list';
import { PrivateLayout } from '@/components/private-layout';

export const AppointmentsTemplate = () => {
  return (
    <PrivateLayout
      title="Atendimentos"
      description="Gerencie e visualize todos os atendimentos"
    >
      <div className="flex flex-col gap-4">
        <AppointmentsMetricCards />
        <AppointmentsTableFilters />
        <AppointmentsList />
      </div>
    </PrivateLayout>
  );
};

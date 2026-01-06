import { PrivateLayout } from '@/components/private-layout';
import { ProceduresTableFilters } from './procedures-table-filter';
import { ProceduresList } from './procedures-list';

export const ProceduresTemplate = () => {
  return (
    <PrivateLayout
      title="Procedimentos"
      description="Análise de procedimentos por faturamento e volume"
    >
      <div className="flex flex-col gap-4">
        <ProceduresTableFilters />
        <ProceduresList />
      </div>
    </PrivateLayout>
  );
};

'use client';

import { useState } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { type DateRange } from 'react-day-picker';

import { PrivateLayout } from '@/components/private-layout';
import { AppointmentsList } from './appointments-list';
import { AppointmentsTableFilters } from './appointments-table-filter';
import { AppointmentsMetricCards } from './appointments-metric-cards';
import { AppointmentsDoctorChart } from './appointments-doctor-chart';
import { useAppointmentsMetrics } from '@/hooks/useAppointmentsMetrics';

export const AppointmentsTemplate = () => {
  // Estados dos filtros - Date range padrão é o mês atual
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 100;

  // Formatar datas para a API
  const startDate = dateRange?.from?.toISOString() || new Date().toISOString();
  const endDate = dateRange?.to?.toISOString() || new Date().toISOString();

  // Buscar métricas
  const { data, isLoading, error } = useAppointmentsMetrics({
    startDate,
    endDate,
    page,
    limit,
    search: search || undefined,
  });

  const handleRemoveFilters = () => {
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });
    setSearch('');
    setPage(1);
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1); // Reset para primeira página ao buscar
  };

  return (
    <PrivateLayout
      title="Atendimentos"
      description="Gerencie e visualize todos os atendimentos"
    >
      <div className="flex flex-col gap-4">
        <AppointmentsTableFilters 
          dateRange={dateRange}
          setDateRange={setDateRange}
          search={search}
          onSearch={handleSearch}
          onRemoveFilters={handleRemoveFilters}
        />
        <AppointmentsMetricCards 
          summary={data?.summary}
          isLoading={isLoading}
        />
        <AppointmentsDoctorChart 
          data={data?.byDoctor || []}
          isLoading={isLoading}
        />
        <AppointmentsList 
          appointments={data?.appointments || []}
          pagination={data?.pagination}
          isLoading={isLoading}
          error={error}
          onPageChange={setPage}
        />
      </div>
    </PrivateLayout>
  );
};

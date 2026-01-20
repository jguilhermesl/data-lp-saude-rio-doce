'use client';

import { useState } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { type DateRange } from 'react-day-picker';

import { PrivateLayout } from '@/components/private-layout';
import { PatientsList } from './patients-list';
import { PatientsTableFilters } from './patients-table-filter';
import { PatientsMetricCards } from './patients-metric-cards';
import { PatientsVipList } from './patients-vip-list';
import { usePatientsMetrics } from '@/hooks/usePatientsMetrics';

export const PatientsTemplate = () => {
  // Estados dos filtros - Date range padrão é o mês atual
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [search, setSearch] = useState('');
  const [minSpent, setMinSpent] = useState('');
  const [maxSpent, setMaxSpent] = useState('');
  const [lastAppointmentDateRange, setLastAppointmentDateRange] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const limit = 100;

  // Formatar datas para a API
  const startDate = dateRange?.from?.toISOString() || new Date().toISOString();
  const endDate = dateRange?.to?.toISOString() || new Date().toISOString();
  const lastAppointmentStartDate = lastAppointmentDateRange?.from?.toISOString();
  const lastAppointmentEndDate = lastAppointmentDateRange?.to?.toISOString();

  // Buscar métricas
  const { data, isLoading, error } = usePatientsMetrics({
    startDate,
    endDate,
    page,
    limit,
    search: search || undefined,
    minSpent: minSpent ? parseFloat(minSpent) : undefined,
    maxSpent: maxSpent ? parseFloat(maxSpent) : undefined,
    lastAppointmentStartDate,
    lastAppointmentEndDate,
  });

  const handleRemoveFilters = () => {
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });
    setSearch('');
    setMinSpent('');
    setMaxSpent('');
    setLastAppointmentDateRange(undefined);
    setPage(1);
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1); // Reset para primeira página ao buscar
  };

  return (
    <PrivateLayout
      title="Pacientes"
      description="Visualize e gerencie seus pacientes"
    >
      <div className="flex flex-col gap-4">
        <PatientsTableFilters 
          dateRange={dateRange}
          setDateRange={setDateRange}
          search={search}
          onSearch={handleSearch}
          onRemoveFilters={handleRemoveFilters}
          minSpent={minSpent}
          setMinSpent={setMinSpent}
          maxSpent={maxSpent}
          setMaxSpent={setMaxSpent}
          lastAppointmentDateRange={lastAppointmentDateRange}
          setLastAppointmentDateRange={setLastAppointmentDateRange}
        />
        <PatientsMetricCards 
          summary={data?.summary}
          isLoading={isLoading}
        />
        <PatientsVipList 
          vipPatients={data?.vipPatients || []}
          isLoading={isLoading}
        />
        <PatientsList 
          patients={data?.patients || []}
          pagination={data?.pagination}
          isLoading={isLoading}
          error={error}
          onPageChange={setPage}
        />
      </div>
    </PrivateLayout>
  );
};

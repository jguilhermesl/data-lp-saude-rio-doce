'use client';

import { useState } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { type DateRange } from 'react-day-picker';

import { PrivateLayout } from '@/components/private-layout';
import { PatientsList } from './patients-list';
import { PatientsTableFilters } from './patients-table-filter';
import { PatientsMetricCards } from './patients-metric-cards';
import { PatientsVipList } from './patients-vip-list';
import { PatientsExportButtons } from './patients-export-buttons';
import { usePatientsMetrics } from '@/hooks/usePatientsMetrics';
import { toLocalISOString } from '@/lib/utils/date';

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

  // Formatar datas para a API (sem conversão de timezone)
  const startDate = dateRange?.from ? toLocalISOString(dateRange.from) : toLocalISOString(new Date());
  
  // Data final deve ir com 23:59:59
  const endDate = dateRange?.to 
    ? toLocalISOString(new Date(
        dateRange.to.getFullYear(),
        dateRange.to.getMonth(),
        dateRange.to.getDate(),
        23,
        59,
        59
      ))
    : toLocalISOString(new Date());
    
  const lastAppointmentStartDate = lastAppointmentDateRange?.from ? toLocalISOString(lastAppointmentDateRange.from) : undefined;
  const lastAppointmentEndDate = lastAppointmentDateRange?.to 
    ? toLocalISOString(new Date(
        lastAppointmentDateRange.to.getFullYear(),
        lastAppointmentDateRange.to.getMonth(),
        lastAppointmentDateRange.to.getDate(),
        23,
        59,
        59
      ))
    : undefined;

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
        {/* Filtros e Botões de Exportação */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
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
          <PatientsExportButtons
            summary={data?.summary}
            patients={data?.patients || []}
            vipPatients={data?.vipPatients || []}
            dateRange={dateRange}
            search={search}
            isLoading={isLoading}
          />
        </div>
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

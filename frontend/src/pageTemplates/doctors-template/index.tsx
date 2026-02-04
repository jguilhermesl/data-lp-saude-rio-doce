'use client';

import { useState, useMemo, useEffect } from 'react';
import { DoctorsList } from './doctors-list';
import { DoctorsTableFilters } from './doctors-table-filter';
import { DoctorsMetricCards } from './doctors-metric-cards';
import { DoctorsExportButtons } from './doctors-export-buttons';
import { DoctorsRankingChart } from './doctors-ranking-chart';
import { PrivateLayout } from '@/components/private-layout';
import { useDoctorsMetrics } from '@/hooks/useDoctorsMetrics';
import { toLocalISOString } from '@/lib/utils/date';

export const DoctorsTemplate = () => {
  // Estado para controlar o período selecionado
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    };
  });

  // Estado para controlar a busca por nome
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce para o campo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Converte as datas para o formato ISO para a API (sem conversão de timezone)
  const { startDate, endDate } = useMemo(() => {
    const from = dateRange.from || new Date();
    const to = dateRange.to || new Date();
    
    // Data final deve ir com 23:59:59
    const toWithTime = new Date(
      to.getFullYear(),
      to.getMonth(),
      to.getDate(),
      23,
      59,
      59
    );
    
    return {
      startDate: toLocalISOString(from),
      endDate: toLocalISOString(toWithTime),
    };
  }, [dateRange]);

  const { data, isLoading, isError } = useDoctorsMetrics({ 
    startDate, 
    endDate,
    search: debouncedSearch || undefined
  });

  return (
    <PrivateLayout
      title="Médicos"
      description="Crie, edite e delete seus médicos"
    >
      <div className="flex flex-col gap-4">
        {/* Filtros e Botões de Exportação */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <DoctorsTableFilters 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            search={search}
            onSearchChange={setSearch}
          />
          <DoctorsExportButtons
            summary={data?.summary}
            doctors={data?.doctors || []}
            dateRange={dateRange}
            search={search}
            isLoading={isLoading}
          />
        </div>
        
        <DoctorsMetricCards 
          summary={data?.summary} 
          isLoading={isLoading} 
          isError={isError} 
        />
        
        <DoctorsRankingChart 
          data={data?.doctors || []} 
          isLoading={isLoading} 
        />
        
        <DoctorsList 
          doctors={data?.doctors || []} 
          isLoading={isLoading} 
        />
      </div>
    </PrivateLayout>
  );
};

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth } from 'date-fns';

import { PrivateLayout } from '@/components/private-layout';
import { ProceduresTableFilters } from './procedures-table-filter';
import { ProceduresList } from './procedures-list';
import { ProceduresMetricCards } from './procedures-metric-cards';
import { proceduresApi } from '@/services/api/procedures';

export const ProceduresTemplate = () => {
  const listRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce para o campo de busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Converte as datas para o formato ISO para a API
  const { startDate, endDate } = useMemo(() => {
    const from = dateRange?.from || startOfMonth(new Date());
    const to = dateRange?.to || endOfMonth(new Date());
    
    return {
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    };
  }, [dateRange]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'procedures-metrics',
      startDate,
      endDate,
      debouncedSearch,
      page,
    ],
    queryFn: () =>
      proceduresApi.getMetrics({
        startDate,
        endDate,
        search: debouncedSearch || undefined,
        page,
        limit: 100,
      }),
    enabled: !!(dateRange?.from && dateRange?.to),
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to the list
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PrivateLayout
      title="Procedimentos"
      description="Análise de procedimentos por faturamento e volume"
    >
      <div className="flex flex-col gap-6">
        <ProceduresTableFilters
          dateRange={dateRange}
          search={search}
          onDateRangeChange={setDateRange}
          onSearchChange={setSearch}
        />

        <ProceduresMetricCards
          summary={data?.summary}
          topSelling={data?.topSelling}
          topRevenue={data?.topRevenue}
          isLoading={isLoading}
          isError={isError}
        />

        <div ref={listRef}>
          <ProceduresList
            procedures={data?.procedures}
            pagination={data?.pagination}
            isLoading={isLoading}
            isError={isError}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </PrivateLayout>
  );
};

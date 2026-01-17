'use client';

import { useState } from 'react';
import { Search, X, CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendary';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AppointmentsTableFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  search: string;
  onSearch: (search: string) => void;
  onRemoveFilters: () => void;
}

export function AppointmentsTableFilters({
  dateRange,
  setDateRange,
  search,
  onSearch,
  onRemoveFilters,
}: AppointmentsTableFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return 'Selecione o período';
    }

    if (range.from && !range.to) {
      return format(range.from, 'dd/MM/yyyy', { locale: ptBR });
    }

    if (range.from && range.to) {
      return `${format(range.from, 'dd/MM/yyyy', { locale: ptBR })} - ${format(
        range.to,
        'dd/MM/yyyy',
        { locale: ptBR }
      )}`;
    }

    return 'Selecione o período';
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold">Filtros:</span>

        {/* Data (intervalo) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 w-[280px] justify-start text-left font-normal',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange(dateRange)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>

        {/* Busca geral (paciente, médico, convênio) */}
        <Input 
          placeholder="Buscar por paciente, médico ou convênio" 
          className="h-8 w-[300px]" 
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />

        <Button variant="secondary" size="sm" type="submit">
          <Search className="mr-2 h-4 w-4" />
          Filtrar resultados
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => {
            setLocalSearch('');
            onRemoveFilters();
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Remover filtros
        </Button>
      </div>
    </form>
  );
}

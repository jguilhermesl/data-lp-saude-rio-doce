'use client';

import { CalendarIcon } from 'lucide-react';
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

interface ProceduresTableFiltersProps {
  dateRange: DateRange | undefined;
  search: string;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onSearchChange: (search: string) => void;
}

export function ProceduresTableFilters({
  dateRange,
  search,
  onDateRangeChange,
  onSearchChange,
}: ProceduresTableFiltersProps) {
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
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold">Filtros:</span>
      <Input
        placeholder="Nome do procedimento"
        className="h-8 w-[320px]"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-8 w-[280px] justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

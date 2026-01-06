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

export function ProceduresTableFilters() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleRemoveFilters = () => {
    setDateRange(undefined);
    // Aqui você pode adicionar a lógica para limpar outros filtros
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
    <form className="flex items-center gap-2">
      <span className="text-sm font-semibold">Filtros:</span>
      <Input placeholder="Nome do procedimento" className="h-8 w-[320px]" />
      <Input placeholder="Especialidade" className="h-8 w-[200px]" />
      <Input placeholder="Convênio" className="h-8 w-[200px]" />

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

      <Button variant="secondary" size="sm" type="submit">
        <Search className="mr-2 h-4 w-4" />
        Filtrar resultados
      </Button>
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={handleRemoveFilters}
      >
        <X className="mr-2 h-4 w-4" />
        Remover filtros
      </Button>
    </form>
  );
}

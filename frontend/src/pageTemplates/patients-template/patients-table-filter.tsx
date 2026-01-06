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

export function PatientsTableFilters() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');

  const handleRemoveFilters = () => {
    setDateRange(undefined);
    setMinValue('');
    setMaxValue('');
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
    <form className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Filtros:</span>

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

        <Input placeholder="Convênio" className="h-8 w-[200px]" />

        <Input placeholder="Especialidade" className="h-8 w-[200px]" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Valor gasto:</span>

        <Input
          placeholder="Valor mínimo (R$)"
          className="h-8 w-[180px]"
          type="number"
          value={minValue}
          onChange={(e) => setMinValue(e.target.value)}
        />

        <span className="text-sm text-muted-foreground">até</span>

        <Input
          placeholder="Valor máximo (R$)"
          className="h-8 w-[180px]"
          type="number"
          value={maxValue}
          onChange={(e) => setMaxValue(e.target.value)}
        />

        <Button variant="secondary" size="sm" type="submit" className="ml-2">
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
      </div>
    </form>
  );
}

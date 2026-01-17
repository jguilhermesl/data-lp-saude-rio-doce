'use client';

import { CalendarIcon, Search } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendary';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DoctorsTableFiltersProps {
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function DoctorsTableFilters({ 
  dateRange, 
  onDateRangeChange,
  search,
  onSearchChange
}: DoctorsTableFiltersProps) {
  
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range) {
      onDateRangeChange({
        from: range.from,
        to: range.to,
      });
    }
  };

  const formatDateRange = (range: { from?: Date; to?: Date }) => {
    if (!range.from) {
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
    <div className="flex flex-row items-center gap-4">
      <span className="text-sm font-semibold">Buscar:</span>
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar médico por nome..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-8"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Período:</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 w-[280px] justify-start text-left font-normal',
                !dateRange.from && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange(dateRange)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

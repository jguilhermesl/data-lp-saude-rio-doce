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

interface PatientsTableFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  search: string;
  onSearch: (search: string) => void;
  onRemoveFilters: () => void;
  minSpent: string;
  setMinSpent: (value: string) => void;
  maxSpent: string;
  setMaxSpent: (value: string) => void;
  lastAppointmentDateRange: DateRange | undefined;
  setLastAppointmentDateRange: (range: DateRange | undefined) => void;
}

export function PatientsTableFilters({
  dateRange,
  setDateRange,
  search,
  onSearch,
  onRemoveFilters,
  minSpent,
  setMinSpent,
  maxSpent,
  setMaxSpent,
  lastAppointmentDateRange,
  setLastAppointmentDateRange,
}: PatientsTableFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [localMinSpent, setLocalMinSpent] = useState(minSpent);
  const [localMaxSpent, setLocalMaxSpent] = useState(maxSpent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
    setMinSpent(localMinSpent);
    setMaxSpent(localMaxSpent);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold">Período de Atendimentos:</span>

        {/* Data do período de atendimentos */}
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
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold">Filtros Adicionais:</span>

        {/* Busca geral (nome, CPF, telefone) */}
        <Input 
          placeholder="Buscar por nome, CPF ou telefone" 
          className="h-8 w-[240px]" 
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />

        {/* Valor Gasto - Mínimo */}
        <Input 
          type="number"
          placeholder="Valor mín. (R$)" 
          className="h-8 w-[140px]" 
          value={localMinSpent}
          onChange={(e) => setLocalMinSpent(e.target.value)}
          min="0"
          step="0.01"
        />

        {/* Valor Gasto - Máximo */}
        <Input 
          type="number"
          placeholder="Valor máx. (R$)" 
          className="h-8 w-[140px]" 
          value={localMaxSpent}
          onChange={(e) => setLocalMaxSpent(e.target.value)}
          min="0"
          step="0.01"
        />

        {/* Data do Último Atendimento */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 w-[280px] justify-start text-left font-normal',
                !lastAppointmentDateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {lastAppointmentDateRange?.from ? formatDateRange(lastAppointmentDateRange) : 'Último atendimento'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={lastAppointmentDateRange}
              onSelect={setLastAppointmentDateRange}
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
          onClick={() => {
            setLocalSearch('');
            setLocalMinSpent('');
            setLocalMaxSpent('');
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

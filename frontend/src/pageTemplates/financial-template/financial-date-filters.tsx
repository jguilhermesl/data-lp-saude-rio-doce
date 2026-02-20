'use client';

import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface FinancialDateFiltersProps {
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
}

export const FinancialDateFilters = ({
  dateRange,
  onDateRangeChange,
}: FinancialDateFiltersProps) => {
  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      onDateRangeChange({ ...dateRange, from: undefined });
      return;
    }
    // Criar data local para evitar problemas de fuso horário
    const [year, month, day] = e.target.value.split('-').map(Number);
    const newDate = new Date(year, month - 1, day, 0, 0, 0);
    onDateRangeChange({ ...dateRange, from: newDate });
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      onDateRangeChange({ ...dateRange, to: undefined });
      return;
    }
    // Criar data local para evitar problemas de fuso horário
    const [year, month, day] = e.target.value.split('-').map(Number);
    const newDate = new Date(year, month - 1, day, 23, 59, 59);
    onDateRangeChange({ ...dateRange, to: newDate });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Filtro de Data Inicial */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Data Inicial
        </label>
        <div className="relative">
          <input
            type="date"
            value={formatDateForInput(dateRange.from)}
            onChange={handleFromDateChange}
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Filtro de Data Final */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Data Final
        </label>
        <div className="relative">
          <input
            type="date"
            value={formatDateForInput(dateRange.to)}
            onChange={handleToDateChange}
            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

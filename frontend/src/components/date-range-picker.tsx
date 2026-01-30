"use client";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (startDate: Date, endDate: Date) => void;
}

export function DateRangePicker({ startDate, endDate, onDateChange }: DateRangePickerProps) {

  const handlePreset = (preset: string) => {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    switch (preset) {
      case "today":
        start = today;
        end = today;
        break;
      case "week":
        start = subDays(today, 7);
        break;
      case "month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case "quarter":
        start = subMonths(today, 3);
        break;
      case "semester":
        start = subMonths(today, 6);
        break;
      case "year":
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      default:
        start = startOfMonth(today);
        end = endOfMonth(today);
    }

    onDateChange(start, end);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Período:</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handlePreset("today")}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={() => handlePreset("week")}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            7 dias
          </button>
          <button
            onClick={() => handlePreset("month")}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Este mês
          </button>
          <button
            onClick={() => handlePreset("lastMonth")}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Mês passado
          </button>
          <button
            onClick={() => handlePreset("quarter")}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            3 meses
          </button>
          <button
            onClick={() => handlePreset("semester")}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            6 meses
          </button>
          <button
            onClick={() => handlePreset("year")}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Este ano
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <input
            type="date"
            value={format(startDate, "yyyy-MM-dd")}
            onChange={(e) => {
              const dateValue = e.target.value;
              if (dateValue) {
                // Criar data no timezone local ao invés de UTC
                const [year, month, day] = dateValue.split('-').map(Number);
                const localDate = new Date(year, month - 1, day);
                onDateChange(localDate, endDate);
              }
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">até</span>
          <input
            type="date"
            value={format(endDate, "yyyy-MM-dd")}
            onChange={(e) => {
              const dateValue = e.target.value;
              if (dateValue) {
                // Criar data no timezone local ao invés de UTC
                const [year, month, day] = dateValue.split('-').map(Number);
                const localDate = new Date(year, month - 1, day);
                onDateChange(startDate, localDate);
              }
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-sm text-gray-600 font-medium">
          {format(startDate, "dd/MM/yyyy", { locale: ptBR })} - {format(endDate, "dd/MM/yyyy", { locale: ptBR })}
        </div>
      </div>
    </div>
  );
}

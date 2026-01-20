'use client';

import { useState } from 'react';
import { TimeSeriesData } from '@/services/api/financial';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FinancialChartProps {
  timeSeries: TimeSeriesData[];
  isLoading: boolean;
}

export const FinancialChart = ({
  timeSeries,
  isLoading,
}: FinancialChartProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Faturamento e Lucro - Evolução Mensal
        </h2>
        <div className="h-80 animate-pulse bg-gray-100 rounded"></div>
      </div>
    );
  }

  // Só renderiza se houver dados de série temporal (período > 1 mês)
  if (!timeSeries || timeSeries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div 
        className={`flex items-center justify-between cursor-pointer ${
          isExpanded ? 'mb-4' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Faturamento e Lucro - Evolução Mensal
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Comparativo de receitas e lucro ao longo do período
          </p>
        </div>
        <button className="text-gray-500 hover:text-gray-700 transition-colors">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>
      
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={timeSeries}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="period"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={formatCurrency}
              labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Faturamento"
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7 }}
              animationBegin={0}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={3}
              name="Lucro"
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
              animationBegin={0}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

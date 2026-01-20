'use client';

import { useState } from 'react';
import { CategoryRanking } from '@/services/api/financial';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FinancialCategoryRankingProps {
  categoryRanking: CategoryRanking[];
  isLoading: boolean;
  isFullWidth?: boolean;
}

interface PieDataItem {
  name: string;
  value: number;
  percentage: number;
  count: number;
}

// Cores para o gráfico de pizza
const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Tooltip customizado (definido fora do componente)
const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: PieDataItem }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{data.name}</p>
        <p className="text-sm text-gray-600">
          Valor: {formatCurrency(data.value)}
        </p>
        <p className="text-sm text-gray-600">
          Percentual: {data.percentage.toFixed(1)}%
        </p>
        <p className="text-sm text-gray-600">
          {data.count} {data.count === 1 ? 'despesa' : 'despesas'}
        </p>
      </div>
    );
  }
  return null;
};

// Label customizado para o gráfico
const renderCustomLabel = (props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
  index?: number;
}) => {
  if (props.percent) {
    return `${(props.percent * 100).toFixed(1)}%`;
  }
  return '';
};

export const FinancialCategoryRanking = ({
  categoryRanking,
  isLoading,
  isFullWidth = false,
}: FinancialCategoryRankingProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ranking de Despesas por Categoria
        </h2>
        <div className="h-80 animate-pulse bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (categoryRanking.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ranking de Despesas por Categoria
        </h2>
        <p className="text-gray-500 text-center py-8">
          Nenhuma despesa encontrada no período selecionado.
        </p>
      </div>
    );
  }

  // Pegar apenas as top 10 categorias
  const topCategories = categoryRanking.slice(0, 10);

  // Preparar dados para o gráfico de pizza
  const pieData = topCategories.map((item) => ({
    name: item.category,
    value: item.totalValue,
    percentage: item.percentage,
    count: item.count,
  }));

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
            Ranking de Despesas por Categoria
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Distribuição de despesas por categoria
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
          <PieChart>
            <Pie
              data={pieData}
              cx={isFullWidth ? "35%" : "50%"}
              cy="50%"
              labelLine={true}
              label={renderCustomLabel}
              outerRadius={isFullWidth ? 140 : 120}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout={isFullWidth ? "vertical" : "horizontal"}
              verticalAlign={isFullWidth ? "middle" : "bottom"}
              align={isFullWidth ? "right" : "center"}
              height={isFullWidth ? undefined : 36}
              iconType="circle"
              wrapperStyle={{
                fontSize: '11px',
                paddingTop: isFullWidth ? '0' : '10px',
                paddingLeft: isFullWidth ? '20px' : '0',
                right: isFullWidth ? '10px' : undefined,
              }}
              formatter={(value: string) => {
                const maxLength = isFullWidth ? 20 : 15;
                const shortValue = value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
                return `${shortValue}`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

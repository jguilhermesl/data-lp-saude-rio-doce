"use client";

import { MetricCard } from "@/components/metric-card";
import { DollarSign,  Receipt, Percent } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface OverviewTabProps {
  data: {
    financial: {
      totalRevenue: number;
      receivedRevenue: number;
      averageTicket: number;
      totalAppointments: number;
      totalExpenses: number;
      totalProfit: number;
    };
    expenses: {
      timeSeries: Array<{
        period: string;
        revenue: number;
        expenses: number;
        profit: number;
        appointments: number;
      }>;
    };
  };
}

export function OverviewTab({ data }: OverviewTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const profitMargin = data.financial.totalRevenue > 0 
    ? ((data.financial.totalProfit / data.financial.totalRevenue) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          title="Faturamento Total"
          value={formatCurrency(data.financial.totalRevenue)}
          icon={DollarSign}
        />
        <MetricCard
          title="Total de Despesas"
          value={formatCurrency(data.financial.totalExpenses)}
          icon={Receipt}
        />
        <MetricCard
          title="Lucro Líquido"
          value={formatCurrency(data.financial.totalProfit)}
          icon={DollarSign}
        />
        <MetricCard
          title="Ticket Médio"
          value={formatCurrency(data.financial.averageTicket)}
          subtitle={`${data.financial.totalAppointments} atendimentos`}
        />
        <MetricCard
          title="Margem de Lucro"
          value={`${profitMargin}%`}
          icon={Percent}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Linha - Evolução */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução Financeira
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.expenses.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip
                formatter={(value: number | undefined) => value ? formatCurrency(value) : "R$ 0,00"}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                name="Faturamento"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                name="Despesas"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3b82f6" 
                name="Lucro"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Atendimentos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Atendimentos por Período
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.expenses.timeSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="appointments" 
                fill="#3b82f6" 
                name="Atendimentos"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

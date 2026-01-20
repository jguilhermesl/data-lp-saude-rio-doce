"use client";

import { MetricCard } from "@/components/metric-card";
import { Microscope } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ProceduresTabProps {
  data: {
    procedures: {
      total: number;
      topSelling: Array<{
        procedureId: string;
        name: string;
        code: string | null;
        quantitySold: number;
        timesOrdered: number;
        totalRevenue: number;
      }>;
    };
  };
}

export function ProceduresTab({ data }: ProceduresTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const pieChartData = data.procedures.topSelling.slice(0, 5).map(proc => ({
    name: proc.name,
    value: proc.totalRevenue,
  }));

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Total de Procedimentos"
          value={data.procedures.total}
          icon={Microscope}
          subtitle="Cadastrados no sistema"
        />
      </div>

      {/* Grid com Ranking e Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Procedimentos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 Procedimentos Mais Vendidos
          </h3>
          <div className="space-y-4">
            {data.procedures.topSelling.slice(0, 5).map((procedure, index) => (
              <div key={procedure.procedureId} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index === 0 ? 'bg-blue-100 text-blue-700' :
                    index === 1 ? 'bg-green-100 text-green-700' :
                    index === 2 ? 'bg-yellow-100 text-yellow-700' :
                    index === 3 ? 'bg-red-100 text-red-700' :
                    'bg-purple-100 text-purple-700'
                  } font-bold text-lg`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{procedure.name}</p>
                    {procedure.code && (
                      <p className="text-sm text-gray-500">Código: {procedure.code}</p>
                    )}
                    <div className="flex gap-4 mt-1">
                      <p className="text-xs text-gray-600">
                        Quantidade: <strong>{procedure.quantitySold}</strong>
                      </p>
                      <p className="text-xs text-gray-600">
                        Vendas: <strong>{procedure.timesOrdered}</strong>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">
                    {formatCurrency(procedure.totalRevenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de Pizza - Distribuição */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição de Faturamento (Top 5)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number | undefined) => value ? formatCurrency(value) : "R$ 0,00"}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Completa */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Todos os Procedimentos
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Procedimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faturamento
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.procedures.topSelling.map((procedure, index) => (
                <tr key={procedure.procedureId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{procedure.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {procedure.code || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {procedure.quantitySold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {procedure.timesOrdered}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(procedure.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

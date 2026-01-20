"use client";

import { MetricCard } from "@/components/metric-card";
import { Stethoscope, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DoctorsTabProps {
  data: {
    doctors: {
      total: number;
      topByRevenue: Array<{
        doctorId: string;
        name: string;
        crm: string | null;
        totalRevenue: number;
      }>;
      bestReturnRate: {
        doctorId: string;
        name: string;
        returnRate: number;
      };
    };
  };
}

export function DoctorsTab({ data }: DoctorsTabProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total de Médicos Ativos"
          value={data.doctors.total}
          icon={Stethoscope}
          subtitle="Atenderam no período"
        />
        <MetricCard
          title="Médico com Melhor Taxa de Retorno"
          value={`${data.doctors.bestReturnRate.returnRate.toFixed(1)}%`}
          icon={TrendingUp}
          subtitle={data.doctors.bestReturnRate.name}
        />
      </div>

      {/* Top 3 Médicos por Faturamento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 3 Médicos por Faturamento
        </h3>
        <div className="space-y-4">
          {data.doctors.topByRevenue.slice(0, 3).map((doctor, index) => (
            <div key={doctor.doctorId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  'bg-orange-100 text-orange-700'
                } font-bold text-lg`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{doctor.name}</p>
                  {doctor.crm && (
                    <p className="text-sm text-gray-500">CRM: {doctor.crm}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900">
                  {formatCurrency(doctor.totalRevenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de Barras - Top 10 Médicos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top 10 Médicos por Faturamento
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={data.doctors.topByRevenue.slice(0, 10)} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number | undefined) => value ? formatCurrency(value) : "R$ 0,00"}
            />
            <Bar 
              dataKey="totalRevenue" 
              fill="#3b82f6" 
              name="Faturamento"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

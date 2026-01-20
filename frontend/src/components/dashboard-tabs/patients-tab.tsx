"use client";

import { MetricCard } from "@/components/metric-card";
import { Users, UserPlus, UserCheck, Percent } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useRouter } from "next/navigation";

interface PatientsTabProps {
  data: {
    patients: {
      total: number;
      newPatients: number;
      recurringPatients: number;
      returnRate: number;
    };
  };
}

export function PatientsTab({ data }: PatientsTabProps) {
  const router = useRouter();
  const pieData = [
    { name: "Pacientes Novos", value: data.patients.newPatients },
    { name: "Pacientes Recorrentes", value: data.patients.recurringPatients },
  ];

  const COLORS = ["#3b82f6", "#10b981"];

  const inactivePatients = Math.floor(data.patients.total * 0.15); // Estimativa de 15% inativos

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Pacientes"
          value={data.patients.total}
          icon={Users}
          subtitle="Atendidos no período"
        />
        <MetricCard
          title="Pacientes Novos"
          value={data.patients.newPatients}
          icon={UserPlus}
          subtitle={`Primeira consulta no período (${((data.patients.newPatients / data.patients.total) * 100).toFixed(1)}% do total)`}
        />
        <MetricCard
          title="Pacientes Recorrentes"
          value={data.patients.recurringPatients}
          icon={UserCheck}
          subtitle={`Pacientes que voltaram para nova consulta (${((data.patients.recurringPatients / data.patients.total) * 100).toFixed(1)}%)`}
        />
        <MetricCard
          title="Taxa de Retorno"
          value={`${data.patients.returnRate.toFixed(1)}%`}
          icon={Percent}
          subtitle="Percentual de pacientes que retornam após primeira consulta"
        />
      </div>

      {/* Grid com Gráfico e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição de Pacientes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Insights Acionáveis */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Insights & Oportunidades
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Campanha de Reativação
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Estimamos <strong>{inactivePatients} pacientes inativos</strong> há mais de 3 meses.
                Esta é uma grande oportunidade para recuperar receita.
              </p>
              <button 
                onClick={() => router.push('/patient/inactive')}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Ver Lista de Reativação
              </button>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">
                Taxa de Retorno
              </h4>
              <p className="text-sm text-green-700">
                Sua taxa de retorno atual é de <strong>{data.patients.returnRate.toFixed(1)}%</strong>.
                {data.patients.returnRate >= 60 
                  ? " Excelente! Continue com o bom trabalho." 
                  : " Foque em melhorar a experiência do paciente para aumentar este número."}
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">
                Estratégia de Fidelização
              </h4>
              <p className="text-sm text-purple-700">
                <strong>{data.patients.newPatients} pacientes novos</strong> no período.
                Invista em programas de fidelização para transformá-los em recorrentes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Painel de Ações de Reativação */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎯 Ações de Reativação Recomendadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-gray-900 mb-2">
              WhatsApp Marketing
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Envie mensagens personalizadas para pacientes inativos
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Criar Campanha →
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-gray-900 mb-2">
              Promoções Especiais
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Ofereça desconto exclusivo para retorno
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Configurar Oferta →
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-gray-900 mb-2">
              Lembretes Automáticos
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Configure lembretes após 3, 6 e 12 meses
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Configurar Sistema →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

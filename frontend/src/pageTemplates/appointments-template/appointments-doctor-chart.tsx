'use client';

import { DoctorAppointmentMetrics } from '@/services/api/appointments';

interface AppointmentsDoctorChartProps {
  data: DoctorAppointmentMetrics[];
  isLoading: boolean;
}

export const AppointmentsDoctorChart = ({ data, isLoading }: AppointmentsDoctorChartProps) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ranking de Médicos
        </h3>
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ranking de Médicos
        </h3>
        <div className="h-96 flex items-center justify-center">
          <p className="text-gray-500">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Pegar os top 10 médicos por faturamento
  const topDoctors = data
    .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
    .slice(0, 10);

  // Calcular o máximo para normalizar as barras
  const maxRevenue = Math.max(...topDoctors.map(d => d.totalRevenue || 0));

  // Gerar cores para cada médico
  const colors = [
    '#3b82f6', // blue-500
    '#10b981', // green-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#14b8a6', // teal-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
    '#84cc16', // lime-500
  ];

  const totalRevenue = topDoctors.reduce((sum, doc) => sum + (doc.totalRevenue || 0), 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Top 10 Médicos por Faturamento
        </h3>
        <div className="text-left sm:text-right">
          <p className="text-sm text-gray-500">Faturamento Total</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>
      
      <div className="space-y-4 overflow-x-hidden">
        {topDoctors.map((doctor, index) => {
          const revenue = doctor.totalRevenue || 0;
          const percentage = maxRevenue > 0 ? ((revenue / maxRevenue) * 100) : 0;
          const revenuePercentage = totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(1) : '0.0';
          
          return (
            <div key={doctor.doctorId} className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold mt-0.5" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {doctor.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {doctor.appointmentCount} atendimento{doctor.appointmentCount !== 1 ? 's' : ''} • 
                      Ticket: {formatCurrency(doctor.averageTicket || 0)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                    {formatCurrency(revenue)}
                  </p>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {revenuePercentage}%
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 ml-7">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colors[index % colors.length],
                    minWidth: percentage > 0 ? '2%' : '0%',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

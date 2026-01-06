'use client';

export const AppointmentsMetricCards = () => {
  // TODO: Replace with real API data filtered by date range
  const metrics = {
    totalRevenue: 145320.5,
    totalAppointments: 247,
    averageTicket: 588.34,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Faturamento Total */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium">Faturamento Total</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {formatCurrency(metrics.totalRevenue)}
        </p>
      </div>

      {/* Número de Atendimentos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium">
          Número de Atendimentos
        </h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {metrics.totalAppointments}
        </p>
      </div>

      {/* Ticket Médio */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium">Ticket Médio</h3>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {formatCurrency(metrics.averageTicket)}
        </p>
      </div>
    </div>
  );
};

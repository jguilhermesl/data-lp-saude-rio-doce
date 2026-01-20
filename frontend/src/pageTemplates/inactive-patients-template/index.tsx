"use client";

import { useState } from "react";
import { useInactivePatients } from "@/hooks/useInactivePatients";
import { PrivateLayout } from "@/components/private-layout";
import { UserX, Calendar, Clock, Search, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function InactivePatientsTemplate() {
  const router = useRouter();
  const [monthsFilter, setMonthsFilter] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useInactivePatients(monthsFilter);

  // Filtrar pacientes por busca
  const filteredPatients = data?.inactivePatients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.fullName.toLowerCase().includes(searchLower) ||
      patient.cpf?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewPatient = (patientId: string) => {
    router.push(`/patient/${patientId}`);
  };

  return (
    <PrivateLayout
      title="Pacientes Inativos"
      description="Lista de pacientes sem atendimento recente para campanhas de reativação"
    >
      <div className="space-y-6">

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro de Período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período de Inatividade
              </label>
              <select
                value={monthsFilter}
                onChange={(e) => setMonthsFilter(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={3}>3 meses ou mais</option>
                <option value={6}>6 meses ou mais</option>
                <option value={12}>12 meses ou mais</option>
                <option value={18}>18 meses ou mais</option>
              </select>
            </div>

            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Paciente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome ou CPF..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-orange-900">
                {isLoading ? "Carregando..." : `${data?.totalInactive || 0} Pacientes Inativos`}
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                Oportunidade de reativação e recuperação de receita
              </p>
            </div>
            <UserX className="w-12 h-12 text-orange-400" />
          </div>
        </div>

        {/* Tabela de Pacientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Atendimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dias Inativo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5 animate-spin" />
                        Carregando pacientes...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                      Erro ao carregar pacientes inativos. Tente novamente.
                    </td>
                  </tr>
                ) : filteredPatients && filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.fullName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {patient.cpf || "Não informado"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {patient.mobilePhone || patient.homePhone || "Não informado"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {format(new Date(patient.lastAppointmentDate), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            patient.daysSinceLastAppointment > 365
                              ? "bg-red-100 text-red-800"
                              : patient.daysSinceLastAppointment > 180
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {patient.daysSinceLastAppointment} dias
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewPatient(patient.id)}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum paciente inativo encontrado com os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dicas de Reativação */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Dicas para Reativação
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              Entre em contato por WhatsApp ou telefone para verificar o interesse em retornar
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              Ofereça uma promoção especial ou desconto exclusivo para retorno
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              Envie lembretes sobre a importância de manter consultas regulares
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              Clique em &quot;Ver Detalhes&quot; para acessar o histórico completo do paciente
            </li>
          </ul>
        </div>
      </div>
    </PrivateLayout>
  );
}

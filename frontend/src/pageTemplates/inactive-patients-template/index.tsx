"use client";

import { useState } from "react";
import { useInactivePatients } from "@/hooks/useInactivePatients";
import { useDoctors } from "@/hooks/useDoctors";
import { useProcedures } from "@/hooks/useProcedures";
import { PrivateLayout } from "@/components/private-layout";
import { InactivePatientsFilters } from "./components/InactivePatientsFilters";
import { UserX, Calendar, Clock, ExternalLink, Stethoscope, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function InactivePatientsTemplate() {
  const router = useRouter();
  const [monthsFilter, setMonthsFilter] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorFilter, setDoctorFilter] = useState<string>("");
  const [procedureFilter, setProcedureFilter] = useState<string>("");
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [procedureSearchTerm, setProcedureSearchTerm] = useState("");

  const { data, isLoading, error } = useInactivePatients({
    months: monthsFilter,
    doctorId: doctorFilter || undefined,
    procedureId: procedureFilter || undefined,
  });
  const { data: doctors = [] } = useDoctors(doctorSearchTerm);
  const { data: procedures = [] } = useProcedures(procedureSearchTerm);

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

  const handleResetFilters = () => {
    setMonthsFilter(3);
    setSearchTerm("");
    setDoctorFilter("");
    setProcedureFilter("");
    setDoctorSearchTerm("");
    setProcedureSearchTerm("");
  };

  return (
    <PrivateLayout
      title="Pacientes Inativos"
      description="Lista de pacientes sem atendimento recente para campanhas de reativação"
    >
      <div className="space-y-6">
        {/* Filtros */}
        <InactivePatientsFilters
          monthsFilter={monthsFilter}
          setMonthsFilter={setMonthsFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          doctorFilter={doctorFilter}
          setDoctorFilter={setDoctorFilter}
          procedureFilter={procedureFilter}
          setProcedureFilter={setProcedureFilter}
          doctorSearchTerm={doctorSearchTerm}
          setDoctorSearchTerm={setDoctorSearchTerm}
          procedureSearchTerm={procedureSearchTerm}
          setProcedureSearchTerm={setProcedureSearchTerm}
          doctors={doctors}
          procedures={procedures}
          onResetFilters={handleResetFilters}
        />

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
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Médico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Procedimentos
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
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5 animate-spin" />
                        Carregando pacientes...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-red-500">
                      Erro ao carregar pacientes inativos. Tente novamente.
                    </td>
                  </tr>
                ) : filteredPatients && filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.fullName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {patient.cpf || "CPF não informado"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {patient.mobilePhone || patient.homePhone || "Não informado"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Stethoscope className="w-4 h-4 text-blue-500" />
                          <span>{patient.lastDoctorName || "Não informado"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {patient.lastProcedures && patient.lastProcedures.length > 0 ? (
                            patient.lastProcedures.slice(0, 2).map((procedure) => (
                              <span
                                key={procedure.id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                <Activity className="w-3 h-3" />
                                {procedure.name.length > 20
                                  ? `${procedure.name.substring(0, 20)}...`
                                  : procedure.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">Nenhum</span>
                          )}
                          {patient.lastProcedures && patient.lastProcedures.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              +{patient.lastProcedures.length - 2}
                            </span>
                          )}
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
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
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

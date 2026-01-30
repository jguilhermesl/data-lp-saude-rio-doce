import { Dispatch, SetStateAction } from "react";
import { AutoCompleteInput } from "@/components/ui/auto-complete";
import { Search, Stethoscope, Activity } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  crm: string | null;
}

interface Procedure {
  id: string;
  name: string;
  code: string | null;
}

interface InactivePatientsFiltersProps {
  monthsFilter: number;
  setMonthsFilter: Dispatch<SetStateAction<number>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  doctorFilter: string;
  setDoctorFilter: Dispatch<SetStateAction<string>>;
  procedureFilter: string;
  setProcedureFilter: Dispatch<SetStateAction<string>>;
  doctorSearchTerm: string;
  setDoctorSearchTerm: Dispatch<SetStateAction<string>>;
  procedureSearchTerm: string;
  setProcedureSearchTerm: Dispatch<SetStateAction<string>>;
  doctors: Doctor[];
  procedures: Procedure[];
}

export function InactivePatientsFilters({
  monthsFilter,
  setMonthsFilter,
  searchTerm,
  setSearchTerm,
  doctorFilter,
  setDoctorFilter,
  procedureFilter,
  setProcedureFilter,
  doctorSearchTerm,
  setDoctorSearchTerm,
  procedureSearchTerm,
  setProcedureSearchTerm,
  doctors,
  procedures,
}: InactivePatientsFiltersProps) {
  // Filtrar médicos baseado no termo de busca
  const filteredDoctors = doctorSearchTerm
    ? doctors.filter((doctor) =>
        doctor.name?.toLowerCase().includes(doctorSearchTerm.toLowerCase())
      )
    : doctors;

  // Filtrar procedimentos baseado no termo de busca
  const filteredProcedures = procedureSearchTerm
    ? procedures.filter((procedure) =>
        procedure.name?.toLowerCase().includes(procedureSearchTerm.toLowerCase()) ||
        procedure.code?.toLowerCase().includes(procedureSearchTerm.toLowerCase())
      )
    : procedures;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de Período */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período de Inatividade
          </label>
          <select
            value={monthsFilter}
            onChange={(e) => setMonthsFilter(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[40px] text-sm"
          >
            <option value={3}>3 meses ou mais</option>
            <option value={6}>6 meses ou mais</option>
            <option value={12}>12 meses ou mais</option>
            <option value={18}>18 meses ou mais</option>
          </select>
        </div>

        {/* Filtro de Médico */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            Filtrar por Médico
          </label>
          <AutoCompleteInput
            setItem={setDoctorFilter}
            suggestions={filteredDoctors}
            getItems={async (value: string) => {
              setDoctorSearchTerm(value);
            }}
            value={doctorSearchTerm}
            setValue={setDoctorSearchTerm}
            placeholder="Digite o nome do médico..."
            renderKeys={["name"]}
            getDisplayValue={(item) => item?.name || ""}
          />
        </div>

        {/* Filtro de Procedimento */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Filtrar por Procedimento
          </label>
          <AutoCompleteInput
            setItem={setProcedureFilter}
            suggestions={filteredProcedures}
            getItems={async (value: string) => {
              setProcedureSearchTerm(value);
            }}
            value={procedureSearchTerm}
            setValue={setProcedureSearchTerm}
            placeholder="Digite o nome do procedimento..."
            renderKeys={["name", "code"]}
            getDisplayValue={(item) => item?.name || ""}
          />
        </div>

        {/* Busca */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar Paciente
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome ou CPF..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-[40px] text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

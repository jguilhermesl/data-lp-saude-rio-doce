import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface InactivePatient {
  id: string;
  fullName: string;
  cpf: string | null;
  homePhone: string | null;
  mobilePhone: string | null;
  lastAppointmentDate: Date;
  daysSinceLastAppointment: number;
  lastDoctorId: string | null;
  lastDoctorName: string | null;
  lastSpecialtyName: string | null;
  lastProcedures: Array<{
    id: string;
    name: string;
  }>;
}

interface InactivePatientsResponse {
  data: {
    inactivePatients: InactivePatient[];
    totalInactive: number;
    monthsThreshold: number;
  };
}

interface UseInactivePatientsParams {
  months?: number;
  doctorId?: string;
  procedureId?: string;
}

export function useInactivePatients({
  months = 3,
  doctorId,
  procedureId,
}: UseInactivePatientsParams = {}) {
  return useQuery({
    queryKey: ["inactive-patients", months, doctorId, procedureId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("months", months.toString());
      if (doctorId) params.append("doctorId", doctorId);
      if (procedureId) params.append("procedureId", procedureId);

      const response = await api.get<InactivePatientsResponse>(
        `/patients/inactive?${params.toString()}`
      );
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

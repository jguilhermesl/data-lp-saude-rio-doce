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
}

interface InactivePatientsResponse {
  data: {
    inactivePatients: InactivePatient[];
    totalInactive: number;
    monthsThreshold: number;
  };
}

export function useInactivePatients(months: number = 3) {
  return useQuery({
    queryKey: ["inactive-patients", months],
    queryFn: async () => {
      const response = await api.get<InactivePatientsResponse>(
        `/patients/inactive?months=${months}`
      );
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

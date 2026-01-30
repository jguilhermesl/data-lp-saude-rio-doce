import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface Doctor {
  id: string;
  name: string;
  crm: string | null;
}

interface DoctorsResponse {
  data: Doctor[];
}

export function useDoctors(searchTerm?: string) {
  return useQuery({
    queryKey: ["doctors", searchTerm],
    queryFn: async () => {
      const response = await api.get<DoctorsResponse>("/doctors");
      const doctors = response.data.data;
      
      // Filtrar localmente se houver termo de busca
      if (searchTerm && searchTerm.trim()) {
        return doctors.filter((doctor) =>
          doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return doctors;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: true,
  });
}

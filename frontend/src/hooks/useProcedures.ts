import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

interface Procedure {
  id: string;
  name: string;
  code: string | null;
}

interface ProceduresResponse {
  data: Procedure[];
}

export function useProcedures(searchTerm?: string) {
  return useQuery({
    queryKey: ["procedures", searchTerm],
    queryFn: async () => {
      const response = await api.get<ProceduresResponse>("/procedures");
      const procedures = response.data.data;
      
      // Filtrar localmente se houver termo de busca
      if (searchTerm && searchTerm.trim()) {
        return procedures.filter((procedure) =>
          procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          procedure.code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return procedures;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: true,
  });
}

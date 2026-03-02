import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type CadenceType = "THIRTY_DAYS" | "SIXTY_DAYS" | "NINETY_DAYS";

export type DispatchStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

interface MessageDispatch {
  id: string;
  cadence: CadenceType;
  status: DispatchStatus;
  totalPatients: number;
  successCount: number;
  errorCount: number;
  date: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
}

interface UseDispatchReportsParams {
  startDate?: Date;
  endDate?: Date;
  cadence?: CadenceType;
}

export function useDispatchReports(params?: UseDispatchReportsParams) {
  return useQuery({
    queryKey: ["dispatch-reports", params?.startDate, params?.endDate, params?.cadence],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params?.startDate) {
        queryParams.append("startDate", params.startDate.toISOString());
      }

      if (params?.endDate) {
        queryParams.append("endDate", params.endDate.toISOString());
      }

      if (params?.cadence) {
        queryParams.append("cadence", params.cadence);
      }

      const queryString = queryParams.toString();
      const url = queryString ? `/dispatches/reports?${queryString}` : '/dispatches/reports';

      const response = await api.get<{ success: boolean; data: MessageDispatch[] }>(url);

      return response.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

// Hook para buscar detalhes de um disparo específico
export function useDispatchById(id: string) {
  return useQuery({
    queryKey: ["dispatch-details", id],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        data: MessageDispatch & {
          successRate: number;
          items: Array<{
            id: string;
            phoneNumber: string;
            messageTemplate: string;
            status: string;
            whatsappMessageId: string | null;
            errorMessage: string | null;
            sentAt: string | null;
            deliveredAt: string | null;
            readAt: string | null;
            patient: {
              id: string;
              fullName: string;
              mobilePhone: string | null;
              homePhone: string | null;
            };
          }>;
        };
      }>(`/dispatches/${id}`);

      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

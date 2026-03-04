import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type CadenceType = "THIRTY_DAYS" | "SIXTY_DAYS" | "NINETY_DAYS";

export type DispatchStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

export type SatisfactionLevel = "NEUTRAL" | "SATISFIED" | "UNSATISFIED";

export type LeadResponseStatus = "NO_RESPONSE" | "RESPONDED" | "INTERESTED" | "NOT_INTERESTED" | "SCHEDULED";

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
            satisfactionLevel: SatisfactionLevel;
            leadStatus: LeadResponseStatus;
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

// Hook para atualizar o nível de satisfação de um item de disparo
export function useUpdateItemSatisfaction(dispatchId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, satisfactionLevel }: { itemId: string; satisfactionLevel: SatisfactionLevel }) => {
      const response = await api.patch(`/dispatches/items/${itemId}/satisfaction`, {
        satisfactionLevel,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalida o cache do disparo para recarregar os dados atualizados
      queryClient.invalidateQueries({ queryKey: ["dispatch-details", dispatchId] });
    },
  });
}

// Hook para atualizar o status de resposta do lead de um item de disparo
export function useUpdateItemLeadStatus(dispatchId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, leadStatus }: { itemId: string; leadStatus: LeadResponseStatus }) => {
      const response = await api.patch(`/dispatches/items/${itemId}/lead-status`, {
        leadStatus,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalida o cache do disparo para recarregar os dados atualizados
      queryClient.invalidateQueries({ queryKey: ["dispatch-details", dispatchId] });
    },
  });
}

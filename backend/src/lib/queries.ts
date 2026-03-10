import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type LeadListParams } from "./api";
import type { LeadUpdate } from "@/types/lead";

export const queryKeys = {
  leads: (params: LeadListParams) => ["leads", params] as const,
  lead: (id: string) => ["leads", id] as const,
  toCall: (params?: object) => ["leads", "to-call", params] as const,
  stats: () => ["leads", "stats"] as const,
};

export function useLeads(params: LeadListParams = {}) {
  return useQuery({
    queryKey: queryKeys.leads(params),
    queryFn: () => api.leads.list(params),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: queryKeys.lead(id),
    queryFn: () => api.leads.get(id),
    enabled: Boolean(id),
  });
}

export function useLeadsToCall(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: queryKeys.toCall(params),
    queryFn: () => api.leads.toCall(params),
  });
}

export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: () => api.leads.stats(),
    refetchInterval: 60_000,
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeadUpdate }) =>
      api.leads.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.setQueryData(queryKeys.lead(updated.id), updated);
    },
  });
}

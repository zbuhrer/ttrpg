import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Npc, InsertNpc } from "@shared/schema";

export function useNpcs(campaignId: number) {
  return useQuery<Npc[]>({
    queryKey: ["/api/campaigns", campaignId, "npcs"],
    enabled: !!campaignId,
  });
}

export function useNpc(id: number) {
  return useQuery<Npc>({
    queryKey: ["/api/npcs", id],
    enabled: !!id,
  });
}

export function useCreateNpc(campaignId: number) {
  return useMutation({
    mutationFn: async (data: InsertNpc) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/npcs`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "npcs"] });
    },
  });
}

export function useUpdateNpc(campaignId: number) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertNpc> }) => {
      const response = await apiRequest("PUT", `/api/npcs/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "npcs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/npcs", id] });
    },
  });
}

export function useDeleteNpc(campaignId: number) {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/npcs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "npcs"] });
    },
  });
}

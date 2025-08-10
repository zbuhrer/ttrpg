import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Quest, InsertQuest } from "@shared/schema";

export function useQuests(campaignId: number) {
  return useQuery<Quest[]>({
    queryKey: ["/api/campaigns", campaignId, "quests"],
    enabled: !!campaignId,
  });
}

export function useQuest(id: number) {
  return useQuery<Quest>({
    queryKey: ["/api/quests", id],
    enabled: !!id,
  });
}

export function useCreateQuest(campaignId: number) {
  return useMutation({
    mutationFn: async (data: InsertQuest) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/quests`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "quests"] });
    },
  });
}

export function useUpdateQuest(campaignId: number) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertQuest> }) => {
      const response = await apiRequest("PUT", `/api/quests/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests", id] });
    },
  });
}

export function useDeleteQuest(campaignId: number) {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/quests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "quests"] });
    },
  });
}

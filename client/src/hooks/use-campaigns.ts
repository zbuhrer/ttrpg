import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Campaign, InsertCampaign } from "@shared/schema";

export function useCampaigns() {
  return useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });
}

export function useCampaign(id: number) {
  return useQuery<Campaign>({
    queryKey: ["/api/campaigns", id],
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  return useMutation({
    mutationFn: async (data: InsertCampaign) => {
      const response = await apiRequest("POST", "/api/campaigns", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    },
  });
}

export function useUpdateCampaign() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCampaign> }) => {
      const response = await apiRequest("PUT", `/api/campaigns/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", id] });
    },
  });
}

export function useDeleteCampaign() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
    },
  });
}

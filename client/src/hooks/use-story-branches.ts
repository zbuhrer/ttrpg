import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StoryBranch, InsertStoryBranch } from "@shared/schema";

export function useStoryBranches(campaignId: number) {
  return useQuery<StoryBranch[]>({
    queryKey: ["/api/campaigns", campaignId, "story-branches"],
    enabled: !!campaignId,
  });
}

export function useStoryBranch(id: number) {
  return useQuery<StoryBranch>({
    queryKey: ["/api/story-branches", id],
    enabled: !!id,
  });
}

export function useCreateStoryBranch(campaignId: number) {
  return useMutation({
    mutationFn: async (data: InsertStoryBranch) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/story-branches`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "story-branches"] });
    },
  });
}

export function useUpdateStoryBranch(campaignId: number) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertStoryBranch> }) => {
      const response = await apiRequest("PUT", `/api/story-branches/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "story-branches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/story-branches", id] });
    },
  });
}

export function useDeleteStoryBranch(campaignId: number) {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/story-branches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "story-branches"] });
    },
  });
}

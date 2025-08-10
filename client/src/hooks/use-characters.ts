import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Character, InsertCharacter } from "@shared/schema";

export function useCharacters(campaignId: number) {
  return useQuery<Character[]>({
    queryKey: ["/api/campaigns", campaignId, "characters"],
    enabled: !!campaignId,
  });
}

export function useCharacter(id: number) {
  return useQuery<Character>({
    queryKey: ["/api/characters", id],
    enabled: !!id,
  });
}

export function useCreateCharacter(campaignId: number) {
  return useMutation({
    mutationFn: async (data: InsertCharacter) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/characters`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "characters"] });
    },
  });
}

export function useUpdateCharacter(campaignId: number) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCharacter> }) => {
      const response = await apiRequest("PUT", `/api/characters/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "characters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/characters", id] });
    },
  });
}

export function useDeleteCharacter(campaignId: number) {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/characters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "characters"] });
    },
  });
}

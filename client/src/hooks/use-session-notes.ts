import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SessionNote, InsertSessionNote } from "@shared/schema";

export function useSessionNotes(campaignId: number) {
  return useQuery<SessionNote[]>({
    queryKey: ["/api/campaigns", campaignId, "session-notes"],
    enabled: !!campaignId,
  });
}

export function useSessionNote(id: number) {
  return useQuery<SessionNote>({
    queryKey: ["/api/session-notes", id],
    enabled: !!id,
  });
}

export function useCreateSessionNote(campaignId: number) {
  return useMutation({
    mutationFn: async (data: InsertSessionNote) => {
      const response = await apiRequest("POST", `/api/campaigns/${campaignId}/session-notes`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "session-notes"] });
    },
  });
}

export function useUpdateSessionNote(campaignId: number) {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSessionNote> }) => {
      const response = await apiRequest("PUT", `/api/session-notes/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "session-notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/session-notes", id] });
    },
  });
}

export function useDeleteSessionNote(campaignId: number) {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/session-notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", campaignId, "session-notes"] });
    },
  });
}

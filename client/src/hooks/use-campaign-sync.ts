import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUpdateCampaign } from "./use-campaigns";
import { useCampaignContext } from "@/contexts/campaign-context";
import { Character } from "@shared/schema";

/**
 * Hook that automatically syncs campaign metadata with actual data
 * - Updates activePlayers count based on actual characters
 * - Can be extended to sync other derived fields
 */
export function useCampaignSync() {
  const { currentCampaign, setCurrentCampaign } = useCampaignContext();
  const updateCampaignMutation = useUpdateCampaign();

  // Get current characters for the campaign
  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/campaigns", currentCampaign?.id, "characters"],
    enabled: !!currentCampaign?.id,
  });

  // Sync player count with actual character count
  useEffect(() => {
    if (!currentCampaign) return;

    const actualPlayerCount = characters.length;
    const storedPlayerCount = currentCampaign.activePlayers || 0;

    // Only update if the counts don't match
    if (actualPlayerCount !== storedPlayerCount) {
      const updatedCampaign = {
        ...currentCampaign,
        activePlayers: actualPlayerCount,
      };

      // Update local state immediately for better UX
      setCurrentCampaign(updatedCampaign);

      // Update the database in the background
      updateCampaignMutation.mutate({
        id: currentCampaign.id,
        data: { activePlayers: actualPlayerCount },
      });
    }
  }, [
    characters.length,
    currentCampaign,
    setCurrentCampaign,
    updateCampaignMutation,
  ]);

  return {
    isUpdating: updateCampaignMutation.isPending,
  };
}

/**
 * Hook to increment session count
 * Call this when starting a new session
 */
export function useIncrementSession() {
  const { currentCampaign, setCurrentCampaign } = useCampaignContext();
  const updateCampaignMutation = useUpdateCampaign();

  const incrementSession = async () => {
    if (!currentCampaign) return;

    const newSessionNumber = (currentCampaign.currentSession || 1) + 1;
    const newTotalSessions = Math.max(
      newSessionNumber - 1,
      currentCampaign.totalSessions || 0,
    );

    const updatedCampaign = {
      ...currentCampaign,
      currentSession: newSessionNumber,
      totalSessions: newTotalSessions,
    };

    // Update local state immediately
    setCurrentCampaign(updatedCampaign);

    // Update the database
    try {
      await updateCampaignMutation.mutateAsync({
        id: currentCampaign.id,
        data: {
          currentSession: newSessionNumber,
          totalSessions: newTotalSessions,
        },
      });
    } catch (error) {
      // Revert on error
      setCurrentCampaign(currentCampaign);
      throw error;
    }
  };

  return {
    incrementSession,
    isIncrementing: updateCampaignMutation.isPending,
  };
}

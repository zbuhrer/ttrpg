import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCampaignContext } from "@/contexts/campaign-context";
import { useUpdateCampaign } from "@/hooks/use-campaigns";
import { useIncrementSession } from "@/hooks/use-campaign-sync";
import { SessionNavigator } from "./session-navigator";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Play,
} from "lucide-react";

interface SessionControlsProps {
  className?: string;
}

export function SessionControls({ className }: SessionControlsProps) {
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const { currentCampaign, setCurrentCampaign } = useCampaignContext();
  const updateCampaignMutation = useUpdateCampaign();
  const { incrementSession, isIncrementing } = useIncrementSession();
  const { toast } = useToast();

  if (!currentCampaign) return null;

  const currentSession = currentCampaign.currentSession || 1;
  const totalSessions = currentCampaign.totalSessions || 0;

  const canGoBack = currentSession > 1;
  const canGoForward = currentSession < totalSessions;

  const handleSessionNavigation = async (direction: "prev" | "next") => {
    const newSession = direction === "prev"
      ? currentSession - 1
      : currentSession + 1;

    if (newSession < 1 || (direction === "next" && newSession > totalSessions)) return;

    try {
      await updateCampaignMutation.mutateAsync({
        id: currentCampaign.id,
        data: { currentSession: newSession },
      });

      setCurrentCampaign({
        ...currentCampaign,
        currentSession: newSession,
      });

      toast({
        title: `Session ${newSession}`,
        description: direction === "prev"
          ? "Viewing previous session"
          : "Viewing next session",
      });
    } catch (error) {
      toast({
        title: "Navigation Error",
        description: "Failed to navigate sessions",
        variant: "destructive",
      });
    }
  };

  const handleQuickStart = async () => {
    try {
      await incrementSession();
      toast({
        title: "New Session Started!",
        description: `Welcome to Session ${currentSession + 1}!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start new session",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className={`flex items-center gap-1 ${className || ""}`}>
        {/* Previous Session */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSessionNavigation("prev")}
          disabled={!canGoBack || updateCampaignMutation.isPending}
          className="h-8 w-8 p-0 text-gray-400 hover:text-fantasy-accent hover:bg-fantasy-charcoal/50 transition-colors"
          title="Previous session"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Session Info - Clickable */}
        <Button
          variant="ghost"
          onClick={() => setIsNavigatorOpen(true)}
          className="h-8 px-3 text-gray-400 hover:text-fantasy-accent hover:bg-fantasy-charcoal/50 transition-colors font-manuscript"
          title="Open session navigator"
        >
          <Calendar className="w-4 h-4 mr-1" />
          <span className="text-sm">
            Session {currentSession}
            {totalSessions > 0 && ` of ${totalSessions}`}
          </span>
        </Button>

        {/* Next Session */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSessionNavigation("next")}
          disabled={!canGoForward || updateCampaignMutation.isPending}
          className="h-8 w-8 p-0 text-gray-400 hover:text-fantasy-accent hover:bg-fantasy-charcoal/50 transition-colors"
          title="Next session"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Quick Start New Session */}
        {currentSession >= totalSessions && (
          <>
            <div className="w-px h-4 bg-fantasy-charcoal mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickStart}
              disabled={isIncrementing}
              className="h-8 px-2 text-fantasy-success hover:text-green-400 hover:bg-green-500/10 transition-colors font-manuscript"
              title="Start new session"
            >
              {isIncrementing ? (
                <div className="w-3 h-3 animate-spin rounded-full border-2 border-fantasy-success border-t-transparent" />
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  <span className="text-xs">New</span>
                </>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Session Navigator Modal */}
      <SessionNavigator
        isOpen={isNavigatorOpen}
        onClose={() => setIsNavigatorOpen(false)}
      />
    </>
  );
}

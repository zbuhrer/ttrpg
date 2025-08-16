import { StoryBranch } from "@shared/schema";
import { useUpdateStoryBranch } from "@/hooks/use-story-branches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Clock, Scale } from "lucide-react";
import { marked } from "marked";

interface StoryBranchCardProps {
  storyBranch: StoryBranch;
  campaignId: number;
}

export function StoryBranchCard({
  storyBranch,
  campaignId,
}: StoryBranchCardProps) {
  const { mutate: updateStoryBranch } = useUpdateStoryBranch(campaignId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-fantasy-success/20 text-fantasy-success";
      case "pending":
        return "bg-fantasy-amber/20 text-fantasy-amber";
      case "dormant":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusIcon = (playerAlignment: string | null) => {
    switch (playerAlignment) {
      case "all":
        return <Users className="text-fantasy-accent text-sm" />;
      case "majority":
        return <Scale className="text-fantasy-accent text-sm" />;
      default:
        return <Clock className="text-gray-400 text-sm" />;
    }
  };

  const handleActivate = async () => {
    console.log("Activate button clicked for branch:", storyBranch.id);
    if (storyBranch.id) {
      try {
        await updateStoryBranch({
          id: storyBranch.id,
          data: { status: "active" },
        });
        console.log("Story branch activated successfully!");
      } catch (error) {
        console.error("Error activating story branch:", error);
      }
    }
  };

  return (
    <div className="p-4 bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-white">{storyBranch.title}</h4>
        <Badge className={getStatusColor(storyBranch.status || "pending")}>
          {storyBranch.status || "pending"}
        </Badge>
      </div>
      <div
        className="text-gray-400 text-sm mb-3"
        dangerouslySetInnerHTML={{
          __html: marked(storyBranch.description || ""),
        }}
      />

      {storyBranch.parentId && (
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">Parent Branch:</p>
          <Badge
            variant="outline"
            className="text-xs text-fantasy-accent border-fantasy-accent/30"
          >
            {storyBranch.parentId}
          </Badge>
        </div>
      )}

      {storyBranch.childBranchIds && storyBranch.childBranchIds.length > 0 && (
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">Child Branches:</p>
          <div className="flex flex-wrap gap-1">
            {storyBranch.childBranchIds.map((childId) => (
              <Badge
                key={childId}
                variant="outline"
                className="text-xs text-fantasy-accent border-fantasy-accent/30"
              >
                {childId}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {storyBranch.assignedCharacters &&
        storyBranch.assignedCharacters.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Assigned Characters:</p>
            <div className="flex flex-wrap gap-1">
              {storyBranch.assignedCharacters.map((characterName) => (
                <Badge
                  key={characterName}
                  variant="outline"
                  className="text-xs text-fantasy-accent border-fantasy-accent/30"
                >
                  {characterName}
                </Badge>
              ))}
            </div>
          </div>
        )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon(storyBranch.playerAlignment)}
          <span className="text-xs text-gray-400">
            {storyBranch.playerAlignment === "all" && "All players aligned"}
            {storyBranch.playerAlignment === "majority" && "Majority aligned"}
            {storyBranch.playerAlignment === "split" && "Players split"}
            {!storyBranch.playerAlignment && "Next session decision"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-fantasy-accent hover:text-fantasy-amber text-sm transition-colors duration-300"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        {storyBranch.status !== "active" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-fantasy-accent hover:text-fantasy-amber text-sm transition-colors duration-300"
            onClick={handleActivate}
          >
            Activate
          </Button>
        )}
      </div>
    </div>
  );
}

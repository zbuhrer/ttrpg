import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { QuickAddModal } from "@/components/modals/quick-add-modal";
import { CampaignManagerModal } from "@/components/campaign/campaign-manager-modal";
import { Plus, Play, Save, Edit, Settings, FolderOpen } from "lucide-react";
import { useUpdateCampaign } from "../../hooks/use-campaigns";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCampaignContext } from "@/contexts/campaign-context";

export function Header() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCampaignManagerOpen, setIsCampaignManagerOpen] = useState(false);
  const [isEditingCampaignName, setIsEditingCampaignName] = useState(false);
  const { currentCampaign, setCurrentCampaign, isLoading } =
    useCampaignContext();
  const updateCampaignMutation = useUpdateCampaign();
  const { toast } = useToast();

  const [editedCampaignName, setEditedCampaignName] = useState("");

  // Initialize and synchronize editedCampaignName with the fetched campaign name
  useEffect(() => {
    if (!isLoading) {
      if (currentCampaign) {
        setEditedCampaignName(currentCampaign.name);
      } else {
        setEditedCampaignName("No Campaign Set");
      }
    }
  }, [currentCampaign, isLoading]);

  const handleCampaignNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedCampaignName(e.target.value);
  };

  const handleSaveCampaignName = async () => {
    if (!currentCampaign) {
      toast({
        title: "Error",
        description: "No campaign to update.",
        variant: "destructive",
      });
      setIsEditingCampaignName(false);
      return;
    }

    const trimmedName = editedCampaignName.trim();
    if (trimmedName === "") {
      toast({
        title: "Validation Error",
        description: "Campaign name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (trimmedName === currentCampaign.name) {
      setIsEditingCampaignName(false);
      return;
    }

    try {
      await updateCampaignMutation.mutateAsync({
        id: currentCampaign.id,
        data: { name: trimmedName },
      });
      toast({
        title: "Success",
        description: "Campaign name updated successfully!",
      });
      setIsEditingCampaignName(false);
    } catch (error) {
      console.error("Failed to update campaign name:", error);
      toast({
        title: "Error",
        description: "Failed to update campaign name.",
        variant: "destructive",
      });
      // Revert to original name on error
      setEditedCampaignName(currentCampaign.name);
      setIsEditingCampaignName(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // Trigger onBlur to save
    } else if (e.key === "Escape") {
      setIsEditingCampaignName(false);
      setEditedCampaignName(
        currentCampaign ? currentCampaign.name : "No Campaign Set",
      ); // Revert
    }
  };

  return (
    <>
      <header className="bg-fantasy-slate/90 backdrop-blur-sm border-b border-fantasy-charcoal px-6 py-4 sticky top-0 z-10 arcane-shimmer">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center group">
              {isEditingCampaignName ? (
                <Input
                  value={editedCampaignName}
                  onChange={handleCampaignNameChange}
                  onBlur={handleSaveCampaignName}
                  onKeyDown={handleKeyDown}
                  className="text-2xl font-fantasy font-semibold text-fantasy-accent mystical-glow bg-transparent border-b border-fantasy-accent focus:border-fantasy-primary focus:outline-none w-auto min-w-[200px]"
                  autoFocus
                  disabled={updateCampaignMutation.isPending}
                />
              ) : (
                <div className="flex items-center">
                  <h2
                    className="text-2xl font-fantasy font-semibold text-fantasy-accent mystical-glow"
                    // Only allow clicking to edit if a campaign exists
                    onClick={() =>
                      currentCampaign && setIsEditingCampaignName(true)
                    }
                  >
                    ⚔️{" "}
                    {isLoading
                      ? "Loading..."
                      : currentCampaign
                        ? currentCampaign.name
                        : "No Campaign Set"}{" "}
                    ⚔️
                  </h2>
                  {!isLoading && currentCampaign && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditingCampaignName(true)}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-fantasy-text hover:text-fantasy-accent"
                      aria-label="Edit campaign name"
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}
              {isEditingCampaignName && (
                <div className="ml-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveCampaignName}
                    disabled={
                      updateCampaignMutation.isPending ||
                      editedCampaignName.trim() === "" ||
                      editedCampaignName.trim() === currentCampaign?.name
                    }
                    className="bg-fantasy-primary hover:bg-fantasy-secondary text-white"
                  >
                    {updateCampaignMutation.isPending ? (
                      "Saving..."
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditingCampaignName(false);
                      setEditedCampaignName(
                        currentCampaign
                          ? currentCampaign.name
                          : "No Campaign Set",
                      );
                    }}
                    disabled={updateCampaignMutation.isPending}
                    className="border-fantasy-charcoal text-fantasy-text hover:bg-fantasy-charcoal"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-1 font-manuscript">
              Campaign Dashboard • Session 12 • 4 Active Players
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsCampaignManagerOpen(true)}
              variant="outline"
              className="px-4 py-2 border-fantasy-charcoal text-fantasy-text hover:bg-fantasy-charcoal transition-colors duration-300 font-manuscript"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              {currentCampaign ? "Switch Campaign" : "New Campaign"}
            </Button>
            <Button
              onClick={() => setIsQuickAddOpen(true)}
              disabled={!currentCampaign}
              className="px-4 py-2 bg-fantasy-primary hover:bg-fantasy-secondary text-white rounded-lg transition-colors duration-300 hover-glow mystical-glow font-manuscript disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Add
            </Button>
            <Button
              disabled={!currentCampaign}
              className="px-4 py-2 bg-fantasy-success hover:bg-green-600 text-white rounded-lg transition-colors duration-300 hover-glow mystical-glow font-manuscript disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Session
            </Button>
            <div className="text-gray-400 flex items-center">
              <Save className="w-4 h-4 mr-1" />
              <span className="text-xs">Auto-saved 2min ago</span>
            </div>
          </div>
        </div>
      </header>

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      <CampaignManagerModal
        isOpen={isCampaignManagerOpen}
        onClose={() => setIsCampaignManagerOpen(false)}
        onCampaignSelected={setCurrentCampaign}
        currentCampaignId={currentCampaign?.id || null}
      />
    </>
  );
}

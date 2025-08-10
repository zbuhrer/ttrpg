import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCampaigns, useCreateCampaign, useDeleteCampaign } from "@/hooks/use-campaigns";
import { Campaign } from "@shared/schema";
import { Plus, Calendar, Users, Trash2, Play, Save, FileText } from "lucide-react";

interface CampaignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignSelected?: (campaign: Campaign) => void;
  currentCampaignId?: number | null;
}

export function CampaignManagerModal({
  isOpen,
  onClose,
  onCampaignSelected,
  currentCampaignId,
}: CampaignManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"create" | "load">("load");
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDescription, setNewCampaignDescription] = useState("");

  const { data: campaigns = [], isLoading: campaignsLoading, refetch } = useCampaigns();
  const createCampaignMutation = useCreateCampaign();
  const deleteCampaignMutation = useDeleteCampaign();
  const { toast } = useToast();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setNewCampaignName("");
      setNewCampaignDescription("");
      // Default to create tab if no campaigns exist
      setActiveTab(campaigns.length === 0 ? "create" : "load");
    }
  }, [isOpen, campaigns.length]);

  const handleCreateCampaign = async () => {
    const trimmedName = newCampaignName.trim();
    if (!trimmedName) {
      toast({
        title: "Validation Error",
        description: "Campaign name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newCampaign = await createCampaignMutation.mutateAsync({
        name: trimmedName,
        description: newCampaignDescription.trim() || null,
        currentSession: 1,
        totalSessions: 0,
        activePlayers: 0,
        storyBranches: 0,
      });

      toast({
        title: "Campaign Created!",
        description: `"${newCampaign.name}" has been created successfully.`,
      });

      // Auto-select the new campaign
      if (onCampaignSelected) {
        onCampaignSelected(newCampaign);
      }

      onClose();
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    if (onCampaignSelected) {
      onCampaignSelected(campaign);
    }
    onClose();
  };

  const handleDeleteCampaign = async (campaign: Campaign, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent selecting the campaign when deleting

    if (!confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCampaignMutation.mutateAsync(campaign.id);
      toast({
        title: "Campaign Deleted",
        description: `"${campaign.name}" has been deleted.`,
      });

      // Refetch campaigns to update the list
      refetch();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-fantasy-slate border-fantasy-charcoal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-fantasy text-fantasy-accent mystical-glow">
            ⚔️ Campaign Manager ⚔️
          </DialogTitle>
        </DialogHeader>

        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === "load" ? "default" : "outline"}
            onClick={() => setActiveTab("load")}
            className={`flex-1 ${
              activeTab === "load"
                ? "bg-fantasy-primary hover:bg-fantasy-secondary text-white"
                : "border-fantasy-charcoal text-fantasy-text hover:bg-fantasy-charcoal"
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Load Campaign
          </Button>
          <Button
            variant={activeTab === "create" ? "default" : "outline"}
            onClick={() => setActiveTab("create")}
            className={`flex-1 ${
              activeTab === "create"
                ? "bg-fantasy-primary hover:bg-fantasy-secondary text-white"
                : "border-fantasy-charcoal text-fantasy-text hover:bg-fantasy-charcoal"
            }`}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        <div className="overflow-y-auto max-h-96">
          {activeTab === "load" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-fantasy font-semibold text-fantasy-accent">
                  Select a Campaign
                </h3>
                <p className="text-sm text-gray-400 font-manuscript">
                  {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} available
                </p>
              </div>

              {campaignsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <Card className="bg-fantasy-dark/30 border-fantasy-charcoal/50">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="h-5 bg-gray-700 rounded w-1/3 mb-2"></div>
                              <div className="h-3 bg-gray-700 rounded w-2/3 mb-3"></div>
                              <div className="flex gap-2">
                                <div className="h-5 bg-gray-700 rounded w-16"></div>
                                <div className="h-5 bg-gray-700 rounded w-16"></div>
                              </div>
                            </div>
                            <div className="h-8 bg-gray-700 rounded w-8"></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <Card className="bg-fantasy-dark/30 border-fantasy-charcoal/50">
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-4">📚</div>
                    <p className="text-gray-400 font-manuscript mb-2">No campaigns found</p>
                    <p className="text-sm text-gray-500 font-manuscript mb-4">
                      Create your first campaign to get started on your adventure!
                    </p>
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="bg-fantasy-primary hover:bg-fantasy-secondary text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Campaign
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                campaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover-glow ${
                      campaign.id === currentCampaignId
                        ? "bg-fantasy-primary/20 border-fantasy-primary shadow-lg"
                        : "bg-fantasy-dark/30 border-fantasy-charcoal/50 hover:bg-fantasy-dark/50"
                    }`}
                    onClick={() => handleSelectCampaign(campaign)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-fantasy font-semibold text-fantasy-accent text-lg">
                              {campaign.name}
                            </h4>
                            {campaign.id === currentCampaignId && (
                              <Badge variant="secondary" className="bg-fantasy-primary text-white text-xs">
                                Current
                              </Badge>
                            )}
                          </div>

                          {campaign.description && (
                            <p className="text-gray-400 text-sm font-manuscript mb-3 line-clamp-2">
                              {campaign.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Session {campaign.currentSession}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{campaign.activePlayers} players</span>
                            </div>
                            <div>
                              Updated {formatDate(campaign.updatedAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDeleteCampaign(campaign, e)}
                            disabled={deleteCampaignMutation.isPending}
                            className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                            title="Delete campaign"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "create" && (
            <div className="space-y-4">
              <h3 className="text-lg font-fantasy font-semibold text-fantasy-accent">
                Create New Campaign
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name" className="text-fantasy-text font-manuscript">
                    Campaign Name *
                  </Label>
                  <Input
                    id="campaign-name"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Enter your epic campaign name..."
                    className="bg-fantasy-dark border-fantasy-charcoal text-fantasy-text placeholder:text-gray-500"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-description" className="text-fantasy-text font-manuscript">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="campaign-description"
                    value={newCampaignDescription}
                    onChange={(e) => setNewCampaignDescription(e.target.value)}
                    placeholder="Describe the world, setting, or theme of your campaign..."
                    className="bg-fantasy-dark border-fantasy-charcoal text-fantasy-text placeholder:text-gray-500 resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">
                    {newCampaignDescription.length}/500 characters
                  </p>
                </div>

                <Separator className="bg-fantasy-charcoal" />

                <Card className="bg-fantasy-dark/30 border-fantasy-charcoal/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-fantasy text-fantasy-accent">
                      ✨ What happens when you create a campaign:
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 text-sm text-gray-400 font-manuscript">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-fantasy-primary rounded-full"></div>
                        A fresh campaign workspace is created
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-fantasy-primary rounded-full"></div>
                        Session tracking starts at Session 1
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-fantasy-primary rounded-full"></div>
                        Empty character, quest, and story trackers are ready
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-fantasy-primary rounded-full"></div>
                        The campaign becomes your active workspace
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreateCampaign}
                    disabled={createCampaignMutation.isPending || !newCampaignName.trim()}
                    className="flex-1 bg-fantasy-primary hover:bg-fantasy-secondary text-white font-manuscript"
                  >
                    {createCampaignMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Campaign
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={createCampaignMutation.isPending}
                    className="px-6 border-fantasy-charcoal text-fantasy-text hover:bg-fantasy-charcoal"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

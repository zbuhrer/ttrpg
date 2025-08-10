import { useQuery } from "@tanstack/react-query";
import { CharacterCard } from "@/components/character-card";
import { StoryBranchCard } from "@/components/story-branch-card";
import { QuestCard } from "@/components/quest-card";
import { ActivityItem } from "@/components/activity-item";
import { DiceRollerWidget } from "@/components/dice-roller-widget";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Calendar,
  CheckSquare,
  GitBranch,
  UserPlus,
  Save,
  FolderOpen,
} from "lucide-react";
import { Character, Quest, StoryBranch, Activity } from "@shared/schema";
import { useCampaignContext } from "@/contexts/campaign-context";
import { CampaignManagerModal } from "@/components/campaign/campaign-manager-modal";
import { useState } from "react";

export default function Dashboard() {
  const { currentCampaign, setCurrentCampaign } = useCampaignContext();
  const [isCampaignManagerOpen, setIsCampaignManagerOpen] = useState(false);

  const { data: characters = [], isLoading: charactersLoading } = useQuery<
    Character[]
  >({
    queryKey: ["/api/campaigns", currentCampaign?.id, "characters"],
    enabled: !!currentCampaign?.id,
  });

  const { data: quests = [], isLoading: questsLoading } = useQuery<Quest[]>({
    queryKey: ["/api/campaigns", currentCampaign?.id, "quests"],
    enabled: !!currentCampaign?.id,
  });

  const { data: storyBranches = [], isLoading: branchesLoading } = useQuery<
    StoryBranch[]
  >({
    queryKey: ["/api/campaigns", currentCampaign?.id, "story-branches"],
    enabled: !!currentCampaign?.id,
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<
    Activity[]
  >({
    queryKey: ["/api/campaigns", currentCampaign?.id, "activities"],
    enabled: !!currentCampaign?.id,
  });

  const stats = {
    activePlayers: currentCampaign?.activePlayers || 0,
    sessionsPlayed: currentCampaign?.totalSessions || 0,
    activeQuests: quests.filter((q) => q.status === "in_progress").length,
    storyBranches: storyBranches.length,
  };

  // Show campaign selection prompt if no campaign is selected
  if (!currentCampaign) {
    return (
      <>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card max-w-lg w-full">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-6">⚔️</div>
              <h2 className="text-2xl font-fantasy font-semibold text-fantasy-accent mystical-glow mb-4">
                Welcome to Aetherquill
              </h2>
              <p className="text-gray-400 font-manuscript mb-6">
                Your digital TTRPG companion awaits. Create a new campaign or
                load an existing one to begin your adventure.
              </p>
              <Button
                onClick={() => setIsCampaignManagerOpen(true)}
                className="w-full bg-fantasy-primary hover:bg-fantasy-secondary text-white font-manuscript mb-4"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Manage Campaigns
              </Button>
              <p className="text-xs text-gray-500 font-manuscript">
                All your campaign data is automatically saved as you play
              </p>
            </CardContent>
          </Card>
        </div>

        <CampaignManagerModal
          isOpen={isCampaignManagerOpen}
          onClose={() => setIsCampaignManagerOpen(false)}
          onCampaignSelected={setCurrentCampaign}
          currentCampaignId={null}
        />
      </>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card hover-glow arcane-shimmer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-manuscript">
                  Active Players
                </p>
                <p className="text-3xl font-bold text-fantasy-accent mt-1 font-fantasy ethereal-pulse">
                  {stats.activePlayers}
                </p>
              </div>
              <div className="w-12 h-12 bg-fantasy-primary/20 rounded-lg flex items-center justify-center mystical-glow">
                <Users className="text-fantasy-accent text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card hover-glow arcane-shimmer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-manuscript">
                  Sessions Played
                </p>
                <p className="text-3xl font-bold text-fantasy-accent mt-1 font-fantasy ethereal-pulse">
                  {stats.sessionsPlayed}
                </p>
              </div>
              <div className="w-12 h-12 bg-fantasy-success/20 rounded-lg flex items-center justify-center mystical-glow">
                <Calendar className="text-fantasy-success text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card hover-glow arcane-shimmer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-manuscript">
                  Active Quests
                </p>
                <p className="text-3xl font-bold text-fantasy-accent mt-1 font-fantasy ethereal-pulse">
                  {stats.activeQuests}
                </p>
              </div>
              <div className="w-12 h-12 bg-fantasy-amber/20 rounded-lg flex items-center justify-center mystical-glow">
                <CheckSquare className="text-fantasy-amber text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card hover-glow arcane-shimmer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-manuscript">
                  Story Branches
                </p>
                <p className="text-3xl font-bold text-fantasy-accent mt-1 font-fantasy ethereal-pulse">
                  {stats.storyBranches}
                </p>
              </div>
              <div className="w-12 h-12 bg-fantasy-mystical/20 rounded-lg flex items-center justify-center mystical-glow">
                <GitBranch className="text-fantasy-mystical text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-fantasy-slate border-fantasy-charcoal shadow-card arcane-shimmer">
          <CardHeader className="border-b border-fantasy-charcoal">
            <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent mystical-glow">
              📜 Recent Activity
            </CardTitle>
            <p className="text-gray-400 text-sm font-manuscript">
              Latest campaign developments and player actions
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto scroll-hidden">
            {activitiesLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-4 p-4 bg-fantasy-dark/30 rounded-lg">
                      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-2 bg-gray-700 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 font-manuscript">
                  No recent activity
                </p>
                <p className="text-sm text-gray-500 mt-1 font-manuscript">
                  Start playing to see campaign events here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Dice Roller */}
          <DiceRollerWidget />

          {/* Quick Notes */}
          <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card arcane-shimmer">
            <CardHeader className="border-b border-fantasy-charcoal">
              <CardTitle className="text-lg font-fantasy font-semibold text-fantasy-accent mystical-glow">
                📋 Session Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea
                className="w-full h-32 bg-fantasy-dark border-fantasy-charcoal rounded-lg p-3 text-gray-100 placeholder-gray-400 resize-none focus:border-fantasy-accent focus:ring-1 focus:ring-fantasy-accent transition-colors duration-300 font-manuscript"
                placeholder="What magical events transpired in this session..."
              />
              <Button className="mt-3 w-full px-4 py-2 bg-fantasy-success hover:bg-green-600 text-white rounded-lg transition-colors duration-300 hover-glow mystical-glow font-manuscript">
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Character Overview */}
      <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card arcane-shimmer">
        <CardHeader className="border-b border-fantasy-charcoal">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent mystical-glow">
                ⚔️ Party Overview
              </CardTitle>
              <p className="text-gray-400 text-sm mt-1 font-manuscript">
                Current player characters and their status
              </p>
            </div>
            <Button className="px-4 py-2 bg-fantasy-primary hover:bg-fantasy-secondary text-white rounded-lg transition-colors duration-300 hover-glow mystical-glow font-manuscript">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {charactersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-700 rounded"></div>
                      <div className="h-2 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : characters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {characters.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 font-manuscript">
                No characters created yet
              </p>
              <p className="text-sm text-gray-500 mt-1 font-manuscript">
                Add your first character to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Story Branches & Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card arcane-shimmer">
          <CardHeader className="border-b border-fantasy-charcoal">
            <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent mystical-glow">
              🌟 Active Story Branches
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1 font-manuscript">
              Current narrative paths and decision points
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {branchesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse p-4 bg-fantasy-dark/30 rounded-lg"
                  >
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-full mb-3"></div>
                    <div className="h-2 bg-gray-700 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : storyBranches.length > 0 ? (
              storyBranches.map((branch) => (
                <StoryBranchCard key={branch.id} storyBranch={branch} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No story branches yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create story branches to track narrative paths
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card arcane-shimmer">
          <CardHeader className="border-b border-fantasy-charcoal">
            <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent mystical-glow">
              📜 Quest Tracker
            </CardTitle>
            <p className="text-gray-400 text-sm mt-1 font-manuscript">
              Active objectives and their completion status
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {questsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse p-4 bg-fantasy-dark/30 rounded-lg"
                  >
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-full mb-3"></div>
                    <div className="h-2 bg-gray-700 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : quests.length > 0 ? (
              quests
                .slice(0, 3)
                .map((quest) => <QuestCard key={quest.id} quest={quest} />)
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No quests created yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add quests to track objectives
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

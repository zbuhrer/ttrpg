import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { StoryBranchCard } from "@/components/story-branch-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertStoryBranchSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GitBranch, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CAMPAIGN_ID = 1;

export default function StoryTimeline() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: storyBranches = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/campaigns", CAMPAIGN_ID, "story-branches"],
  });

  const { data: characters = [] } = useQuery<any[]>({
    queryKey: ["/api/campaigns", CAMPAIGN_ID, "characters"],
  });

  const form = useForm({
    resolver: zodResolver(insertStoryBranchSchema),
    defaultValues: {
      campaignId: CAMPAIGN_ID,
      title: "",
      description: "",
      status: "pending",
      conditions: "",
      consequences: "",
      playerAlignment: "",
      assignedCharacters: [],
      notes: "",
    },
  });

  const createStoryBranchMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        "POST",
        `/api/campaigns/${CAMPAIGN_ID}/story-branches`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/campaigns", CAMPAIGN_ID, "story-branches"],
      });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Story branch created",
        description: "The story branch has been added to your campaign.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create story branch. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Convert comma-separated strings to arrays
    const processedData = {
      ...data,
      conditions: data.conditions
        ? data.conditions
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      consequences: data.consequences
        ? data.consequences
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
    };
    createStoryBranchMutation.mutate(processedData);
  };

  const filteredBranches = storyBranches.filter(
    (branch: any) =>
      branch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeBranches = filteredBranches.filter(
    (b: any) => b.status === "active",
  );
  const pendingBranches = filteredBranches.filter(
    (b: any) => b.status === "pending",
  );
  const dormantBranches = filteredBranches.filter(
    (b: any) => b.status === "dormant",
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fantasy font-bold text-fantasy-accent">
            Story & Timeline
          </h1>
          <p className="text-gray-400 mt-1">
            Manage narrative paths and story progression
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fantasy-primary hover:bg-fantasy-secondary text-white hover-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Story Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-fantasy-slate border-fantasy-charcoal shadow-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
                Create Story Branch
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-fantasy-dark border-fantasy-charcoal"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-fantasy-dark border-fantasy-charcoal"
                          placeholder="Describe this narrative path and its implications..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="bg-fantasy-dark border-fantasy-charcoal">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="dormant">Dormant</SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="playerAlignment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player Alignment</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="bg-fantasy-dark border-fantasy-charcoal">
                              <SelectValue placeholder="Select alignment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Players</SelectItem>
                              <SelectItem value="majority">Majority</SelectItem>
                              <SelectItem value="split">
                                Split Decision
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conditions (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-fantasy-dark border-fantasy-charcoal"
                          placeholder="e.g. Player level >= 5, Ancient key obtained, Dragon defeated"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="consequences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consequences (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-fantasy-dark border-fantasy-charcoal"
                          placeholder="e.g. Kingdom saved, Alliance formed, Portal opened"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedCharacters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Characters</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">
                            Select which characters are involved in this story
                            branch
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {characters.map((character: any) => (
                              <label
                                key={character.id}
                                className="flex items-center space-x-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  className="rounded border-fantasy-charcoal"
                                  checked={field.value.includes(character.name)}
                                  onChange={(e) => {
                                    const newValue = e.target.checked
                                      ? [...field.value, character.name]
                                      : field.value.filter(
                                          (name: string) =>
                                            name !== character.name,
                                        );
                                    field.onChange(newValue);
                                  }}
                                />
                                <span className="text-sm text-white">
                                  {character.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-fantasy-dark border-fantasy-charcoal"
                          placeholder="Additional notes about this story branch..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createStoryBranchMutation.isPending}
                    className="bg-fantasy-primary hover:bg-fantasy-secondary"
                  >
                    {createStoryBranchMutation.isPending
                      ? "Creating..."
                      : "Create Branch"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search story branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-fantasy-dark border-fantasy-charcoal"
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Active Branches */}
        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent flex items-center">
              <div className="w-3 h-3 bg-fantasy-success rounded-full mr-2"></div>
              Active Branches ({activeBranches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeBranches.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {activeBranches.map((branch: any) => (
                  <StoryBranchCard key={branch.id} storyBranch={branch} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No active story branches</p>
                <p className="text-sm text-gray-500 mt-1">
                  Activate branches based on player decisions
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Branches */}
        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent flex items-center">
              <div className="w-3 h-3 bg-fantasy-amber rounded-full mr-2"></div>
              Pending Branches ({pendingBranches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingBranches.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingBranches.map((branch: any) => (
                  <StoryBranchCard key={branch.id} storyBranch={branch} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No pending story branches</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create branches for upcoming decisions
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dormant Branches */}
        {dormantBranches.length > 0 && (
          <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Dormant Branches ({dormantBranches.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {dormantBranches.map((branch: any) => (
                  <StoryBranchCard key={branch.id} storyBranch={branch} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isLoading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="bg-fantasy-slate border-fantasy-charcoal shadow-card animate-pulse"
            >
              <CardHeader>
                <div className="h-6 bg-gray-700 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="p-4 bg-fantasy-dark/30 rounded-lg">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-full mb-3"></div>
                      <div className="h-2 bg-gray-700 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredBranches.length === 0 && (
        <div className="text-center py-12">
          <GitBranch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No story branches found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm
              ? "Try a different search term"
              : "Create your first story branch to track narrative paths"}
          </p>
        </div>
      )}
    </div>
  );
}

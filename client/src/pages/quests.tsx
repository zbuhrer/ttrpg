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
import { QuestCard } from "@/components/quest-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertQuestSchema, Quest, InsertQuest } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckSquare, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CAMPAIGN_ID = 1;

export default function Quests() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const { toast } = useToast();

  const { data: quests = [], isLoading } = useQuery<Quest[]>({
    queryKey: ["/api/campaigns", CAMPAIGN_ID, "quests"],
  });

  const form = useForm({
    resolver: zodResolver(insertQuestSchema),
    defaultValues: {
      campaignId: CAMPAIGN_ID,
      title: "",
      description: "",
      status: "in_progress",
      priority: "normal",
      progress: 0,
      maxProgress: 100,
      objectives: "",
      completedObjectives: "",
      reward: "",
      timeLimit: "",
      notes: "",
    },
  });

  const createQuestMutation = useMutation({
    mutationFn: async (data: InsertQuest) => {
      const response = await apiRequest(
        "POST",
        `/api/campaigns/${CAMPAIGN_ID}/quests`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/campaigns", CAMPAIGN_ID, "quests"],
      });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Quest created",
        description: "The quest has been added to your campaign.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create quest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Convert comma-separated strings to arrays
    const processedData = {
      ...data,
      objectives: data.objectives
        ? data.objectives.split(",").map((o: string) => o.trim())
        : [],
      completedObjectives: data.completedObjectives
        ? data.completedObjectives.split(",").map((o: string) => o.trim())
        : [],
    };
    createQuestMutation.mutate(processedData);
  };

  const filteredQuests = quests.filter((quest: Quest) => {
    const matchesSearch =
      quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quest.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || quest.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || quest.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const inProgressQuests = filteredQuests.filter(
    (q: Quest) => q.status === "in_progress",
  );
  const completedQuests = filteredQuests.filter(
    (q: Quest) => q.status === "completed",
  );
  const failedQuests = filteredQuests.filter(
    (q: Quest) => q.status === "failed",
  );
  const optionalQuests = filteredQuests.filter(
    (q: Quest) => q.status === "optional",
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fantasy font-bold text-fantasy-accent">
            Quests
          </h1>
          <p className="text-gray-400 mt-1">
            Manage campaign objectives and progress
          </p>
        </div>
        <Button
          className="bg-fantasy-primary hover:bg-fantasy-primary/80"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Quest
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search quests..."
            className="pl-10 bg-fantasy-dark border-fantasy-charcoal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value)}
          >
            <SelectTrigger className="w-[160px] bg-fantasy-dark/30 border-fantasy-charcoal">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="optional">Optional</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterPriority}
            onValueChange={(value) => setFilterPriority(value)}
          >
            <SelectTrigger className="w-[160px] bg-fantasy-dark/30 border-fantasy-charcoal">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create Quest Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild className="hidden">
          <Button>Hidden Trigger</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] bg-fantasy-slate border-fantasy-charcoal">
          <DialogHeader>
            <DialogTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
              Create New Quest
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quest Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter quest title"
                        className="bg-fantasy-dark/30 border-fantasy-charcoal"
                        {...field}
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
                        placeholder="Describe the quest..."
                        className="min-h-32 bg-fantasy-dark/30 border-fantasy-charcoal"
                        {...field}
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-fantasy-dark/30 border-fantasy-charcoal">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="optional">Optional</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-fantasy-dark/30 border-fantasy-charcoal">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="objectives"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objectives (comma-separated)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Find the artifact, Defeat the guardian, Return to the village"
                        className="min-h-20 bg-fantasy-dark/30 border-fantasy-charcoal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="500 gold, magic item, etc."
                        className="bg-fantasy-dark/30 border-fantasy-charcoal"
                        {...field}
                      />
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
                        placeholder="Additional quest notes..."
                        className="min-h-20 bg-fantasy-dark/30 border-fantasy-charcoal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-fantasy-primary hover:bg-fantasy-primary/80"
                >
                  Create Quest
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* In Progress Quests */}
        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent flex items-center">
              <div className="w-3 h-3 bg-fantasy-success rounded-full mr-2"></div>
              In Progress ({inProgressQuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inProgressQuests.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {inProgressQuests.map((quest: Quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No quests in progress</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create new quests to track objectives
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Optional Quests */}
        {optionalQuests.length > 0 && (
          <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                Optional ({optionalQuests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {optionalQuests.map((quest: Quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Completed ({completedQuests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {completedQuests.map((quest: Quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed Quests */}
        {failedQuests.length > 0 && (
          <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
            <CardHeader>
              <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Failed ({failedQuests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {failedQuests.map((quest: Quest) => (
                  <QuestCard key={quest.id} quest={quest} />
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
                      <div className="h-2 bg-gray-700 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredQuests.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No quests found</p>
          <p className="text-sm text-gray-500 mt-1">
            {searchTerm || filterStatus !== "all" || filterPriority !== "all"
              ? "Try a different search term or filter"
              : "Create your first quest to start tracking objectives"}
          </p>
        </div>
      )}
    </div>
  );
}

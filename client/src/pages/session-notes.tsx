import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSessionNoteSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StickyNote, Plus, Search, Calendar, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CAMPAIGN_ID = 1;

export default function SessionNotes() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: sessionNotes = [], isLoading } = useQuery({
    queryKey: ["/api/campaigns", CAMPAIGN_ID, "session-notes"],
  });

  const form = useForm({
    resolver: zodResolver(insertSessionNoteSchema),
    defaultValues: {
      campaignId: CAMPAIGN_ID,
      sessionNumber: 1,
      title: "",
      content: "",
      keyEvents: [],
      playerDecisions: [],
      npcsIntroduced: [],
      questsUpdated: [],
    },
  });

  const createSessionNoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/campaigns/${CAMPAIGN_ID}/session-notes`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", CAMPAIGN_ID, "session-notes"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Session note created",
        description: "The session note has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create session note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Convert comma-separated strings to arrays
    const processedData = {
      ...data,
      keyEvents: data.keyEvents ? data.keyEvents.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      playerDecisions: data.playerDecisions ? data.playerDecisions.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      npcsIntroduced: data.npcsIntroduced ? data.npcsIntroduced.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      questsUpdated: data.questsUpdated ? data.questsUpdated.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    };
    createSessionNoteMutation.mutate(processedData);
  };

  const filteredNotes = sessionNotes.filter((note) =>
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.sessionNumber.toString().includes(searchTerm)
  );

  // Get the next session number
  const nextSessionNumber = sessionNotes.length > 0 
    ? Math.max(...sessionNotes.map(n => n.sessionNumber)) + 1 
    : 1;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fantasy font-bold text-fantasy-accent">Session Notes</h1>
          <p className="text-gray-400 mt-1">Record and track campaign sessions</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-fantasy-primary hover:bg-fantasy-secondary text-white hover-glow"
              onClick={() => form.setValue('sessionNumber', nextSessionNumber)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Session Note
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-fantasy-slate border-fantasy-charcoal shadow-card max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
                Create Session Note
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sessionNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1" 
                            className="bg-fantasy-dark border-fantasy-charcoal"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            placeholder="e.g. The Dragon's Lair"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Summary</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="bg-fantasy-dark border-fantasy-charcoal h-32"
                          placeholder="Describe what happened in this session..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="keyEvents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Events (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="bg-fantasy-dark border-fantasy-charcoal"
                          placeholder="e.g. Dragon defeated, Crown fragment found, Alliance formed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="playerDecisions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player Decisions (comma-separated)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          className="bg-fantasy-dark border-fantasy-charcoal"
                          placeholder="e.g. Spared the goblin chief, Chose the dark path, Negotiated peace"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="npcsIntroduced"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NPCs Introduced (comma-separated)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-fantasy-dark border-fantasy-charcoal"
                            placeholder="e.g. Captain Aldrich, Sage Miriel"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="questsUpdated"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quests Updated (comma-separated)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-fantasy-dark border-fantasy-charcoal"
                            placeholder="e.g. Find the Crown, Rescue the Princess"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                    disabled={createSessionNoteMutation.isPending}
                    className="bg-fantasy-primary hover:bg-fantasy-secondary"
                  >
                    {createSessionNoteMutation.isPending ? "Creating..." : "Create Note"}
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
            placeholder="Search session notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-fantasy-dark border-fantasy-charcoal"
          />
        </div>
      </div>

      <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
            Session History ({filteredNotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-700 rounded w-20"></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-3 bg-gray-700 rounded w-full"></div>
                      <div className="h-3 bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotes.length > 0 ? (
            <div className="space-y-6">
              {filteredNotes.map((note) => (
                <div key={note.id} className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-6 hover-glow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-fantasy-accent mr-2" />
                      <h3 className="text-lg font-semibold text-white">
                        Session {note.sessionNumber}
                        {note.title && `: ${note.title}`}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-400">
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                  
                  {note.content && (
                    <div className="mb-4">
                      <p className="text-gray-300">{note.content}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {note.keyEvents && note.keyEvents.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-fantasy-accent mb-2">Key Events:</p>
                        <div className="space-y-1">
                          {note.keyEvents.map((event, index) => (
                            <Badge key={index} variant="secondary" className="mr-1 mb-1">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {note.playerDecisions && note.playerDecisions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-fantasy-accent mb-2">Player Decisions:</p>
                        <div className="space-y-1">
                          {note.playerDecisions.map((decision, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {decision}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {note.npcsIntroduced && note.npcsIntroduced.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-fantasy-accent mb-2">NPCs Introduced:</p>
                        <div className="space-y-1">
                          {note.npcsIntroduced.map((npc, index) => (
                            <Badge key={index} className="bg-fantasy-success/20 text-fantasy-success mr-1 mb-1">
                              {npc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {note.questsUpdated && note.questsUpdated.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-fantasy-accent mb-2">Quests Updated:</p>
                        <div className="space-y-1">
                          {note.questsUpdated.map((quest, index) => (
                            <Badge key={index} className="bg-fantasy-amber/20 text-fantasy-amber mr-1 mb-1">
                              {quest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <StickyNote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No session notes found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm 
                  ? "Try a different search term" 
                  : "Create your first session note to track campaign progress"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

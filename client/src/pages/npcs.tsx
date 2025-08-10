import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertNpcSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Plus, Search, UserCircle, Crown, Sword, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CAMPAIGN_ID = 1;

export default function NPCs() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const { toast } = useToast();

  const { data: npcs = [], isLoading } = useQuery({
    queryKey: ["/api/campaigns", CAMPAIGN_ID, "npcs"],
  });

  const form = useForm({
    resolver: zodResolver(insertNpcSchema),
    defaultValues: {
      campaignId: CAMPAIGN_ID,
      name: "",
      role: "",
      location: "",
      description: "",
      relationships: {},
      notes: "",
      portraitUrl: "",
    },
  });

  const createNpcMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/campaigns/${CAMPAIGN_ID}/npcs`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", CAMPAIGN_ID, "npcs"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "NPC created",
        description: "The NPC has been added to your campaign.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create NPC. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createNpcMutation.mutate(data);
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'ally': return <UserCircle className="w-4 h-4 text-fantasy-success" />;
      case 'enemy': return <Sword className="w-4 h-4 text-fantasy-error" />;
      case 'merchant': return <ShoppingCart className="w-4 h-4 text-fantasy-amber" />;
      case 'noble': return <Crown className="w-4 h-4 text-fantasy-accent" />;
      default: return <UserCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'ally': return 'bg-fantasy-success/20 text-fantasy-success';
      case 'enemy': return 'bg-fantasy-error/20 text-fantasy-error';
      case 'merchant': return 'bg-fantasy-amber/20 text-fantasy-amber';
      case 'noble': return 'bg-fantasy-accent/20 text-fantasy-accent';
      case 'neutral': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-fantasy-primary/20 text-fantasy-accent';
    }
  };

  const filteredNpcs = npcs.filter((npc) => {
    const matchesSearch = npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         npc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         npc.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || npc.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const npcRoles = [...new Set(npcs.map(n => n.role).filter(Boolean))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fantasy font-bold text-fantasy-accent">NPCs</h1>
          <p className="text-gray-400 mt-1">Manage non-player characters and relationships</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fantasy-primary hover:bg-fantasy-secondary text-white hover-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add NPC
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-fantasy-slate border-fantasy-charcoal shadow-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
                Create New NPC
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-fantasy-dark border-fantasy-charcoal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="bg-fantasy-dark border-fantasy-charcoal">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ally">Ally</SelectItem>
                              <SelectItem value="enemy">Enemy</SelectItem>
                              <SelectItem value="neutral">Neutral</SelectItem>
                              <SelectItem value="merchant">Merchant</SelectItem>
                              <SelectItem value="noble">Noble</SelectItem>
                              <SelectItem value="innkeeper">Innkeeper</SelectItem>
                              <SelectItem value="guard">Guard</SelectItem>
                              <SelectItem value="priest">Priest</SelectItem>
                              <SelectItem value="scholar">Scholar</SelectItem>
                              <SelectItem value="criminal">Criminal</SelectItem>
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-fantasy-dark border-fantasy-charcoal"
                          placeholder="Where can this NPC be found?"
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
                          placeholder="Describe this NPC's appearance, personality, and motivations..."
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
                          {...field} 
                          className="bg-fantasy-dark border-fantasy-charcoal"
                          placeholder="Additional notes, secrets, or plot hooks..."
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
                    disabled={createNpcMutation.isPending}
                    className="bg-fantasy-primary hover:bg-fantasy-secondary"
                  >
                    {createNpcMutation.isPending ? "Creating..." : "Create NPC"}
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
            placeholder="Search NPCs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-fantasy-dark border-fantasy-charcoal"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-40 bg-fantasy-dark border-fantasy-charcoal">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {npcRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
            All NPCs ({filteredNpcs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-full mr-4"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-700 rounded w-full"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNpcs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNpcs.map((npc) => (
                <div key={npc.id} className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-6 hover-glow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-fantasy-charcoal rounded-full flex items-center justify-center mr-4">
                      <UserCircle className="w-8 h-8 text-fantasy-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{npc.name}</h3>
                      {npc.role && (
                        <div className="flex items-center mt-1">
                          {getRoleIcon(npc.role)}
                          <Badge className={`${getRoleColor(npc.role)} ml-2`}>
                            {npc.role}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  {npc.location && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-fantasy-accent mb-1">Location:</p>
                      <p className="text-sm text-gray-400">{npc.location}</p>
                    </div>
                  )}
                  {npc.description && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-fantasy-accent mb-1">Description:</p>
                      <p className="text-sm text-gray-400 line-clamp-3">{npc.description}</p>
                    </div>
                  )}
                  {npc.notes && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-fantasy-accent mb-1">Notes:</p>
                      <p className="text-sm text-gray-500 line-clamp-2">{npc.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No NPCs found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || filterRole !== "all" 
                  ? "Try a different search term or filter" 
                  : "Create your first NPC to populate your world"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

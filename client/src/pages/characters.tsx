import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CharacterCard } from "@/components/character-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCharacterSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CAMPAIGN_ID = 1;

export default function Characters() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: characters = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/campaigns", CAMPAIGN_ID, "characters"],
  });

  const form = useForm({
    resolver: zodResolver(insertCharacterSchema),
    defaultValues: {
      campaignId: CAMPAIGN_ID,
      name: "",
      race: "",
      characterClass: "",
      level: 1,
      currentHp: 1,
      maxHp: 1,
      currentXp: 0,
      xpToNextLevel: 300,
      armorClass: 10,
      spellSlots: 0,
      maxSpellSlots: 0,
      abilities: {},
      equipment: [],
      notes: "",
      portraitUrl: "",
    },
  });

  const createCharacterMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/campaigns/${CAMPAIGN_ID}/characters`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", CAMPAIGN_ID, "characters"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Character created",
        description: "The character has been added to your campaign.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create character. Please try again.",
        variant: "destructive",
      });
    },
  });

  const editCharacterMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/characters/${editingCharacter?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", CAMPAIGN_ID, "characters"] });
      setIsEditOpen(false);
      setEditingCharacter(null);
      form.reset();
      toast({
        title: "Character updated",
        description: "The character has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update character. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    if (editingCharacter) {
      editCharacterMutation.mutate(data);
    } else {
      createCharacterMutation.mutate(data);
    }
  };

  const handleEdit = (character: any) => {
    setEditingCharacter(character);
    form.reset({
      campaignId: character.campaignId,
      name: character.name,
      race: character.race,
      characterClass: character.characterClass,
      level: character.level,
      currentHp: character.currentHp,
      maxHp: character.maxHp,
      currentXp: character.currentXp,
      xpToNextLevel: character.xpToNextLevel,
      armorClass: character.armorClass,
      spellSlots: character.spellSlots,
      maxSpellSlots: character.maxSpellSlots,
      abilities: character.abilities,
      equipment: character.equipment,
      notes: character.notes || "",
      portraitUrl: character.portraitUrl || "",
    });
    setIsEditOpen(true);
  };

  const filteredCharacters = characters.filter((character: any) =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.race.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.characterClass.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fantasy font-bold text-fantasy-accent">Characters</h1>
          <p className="text-gray-400 mt-1">Manage your player characters</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fantasy-primary hover:bg-fantasy-secondary text-white hover-glow">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Character
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-fantasy-slate border-fantasy-charcoal shadow-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
                Create New Character
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
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="race"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Race</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="bg-fantasy-dark border-fantasy-charcoal">
                              <SelectValue placeholder="Select race" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="human">Human</SelectItem>
                              <SelectItem value="elf">Elf</SelectItem>
                              <SelectItem value="dwarf">Dwarf</SelectItem>
                              <SelectItem value="halfling">Halfling</SelectItem>
                              <SelectItem value="dragonborn">Dragonborn</SelectItem>
                              <SelectItem value="gnome">Gnome</SelectItem>
                              <SelectItem value="half-elf">Half-Elf</SelectItem>
                              <SelectItem value="half-orc">Half-Orc</SelectItem>
                              <SelectItem value="tiefling">Tiefling</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="characterClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="bg-fantasy-dark border-fantasy-charcoal">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="barbarian">Barbarian</SelectItem>
                              <SelectItem value="bard">Bard</SelectItem>
                              <SelectItem value="cleric">Cleric</SelectItem>
                              <SelectItem value="druid">Druid</SelectItem>
                              <SelectItem value="fighter">Fighter</SelectItem>
                              <SelectItem value="monk">Monk</SelectItem>
                              <SelectItem value="paladin">Paladin</SelectItem>
                              <SelectItem value="ranger">Ranger</SelectItem>
                              <SelectItem value="rogue">Rogue</SelectItem>
                              <SelectItem value="sorcerer">Sorcerer</SelectItem>
                              <SelectItem value="warlock">Warlock</SelectItem>
                              <SelectItem value="wizard">Wizard</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="maxHp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max HP</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1" 
                            className="bg-fantasy-dark border-fantasy-charcoal"
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(value);
                              form.setValue("currentHp", value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="armorClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Armor Class</FormLabel>
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
                    name="maxSpellSlots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Spell Slots</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            className="bg-fantasy-dark border-fantasy-charcoal"
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(value);
                              form.setValue("spellSlots", value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                          placeholder="Character background, personality, etc."
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
                    disabled={createCharacterMutation.isPending}
                    className="bg-fantasy-primary hover:bg-fantasy-secondary"
                  >
                    {createCharacterMutation.isPending ? "Creating..." : "Create Character"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Character Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-fantasy-slate border-fantasy-charcoal shadow-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
                Edit Character
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
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1" 
                            max="20" 
                            className="bg-fantasy-dark border-fantasy-charcoal"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="race"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Race</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-fantasy-dark border-fantasy-charcoal">
                              <SelectValue placeholder="Select race" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="human">Human</SelectItem>
                              <SelectItem value="elf">Elf</SelectItem>
                              <SelectItem value="dwarf">Dwarf</SelectItem>
                              <SelectItem value="halfling">Halfling</SelectItem>
                              <SelectItem value="dragonborn">Dragonborn</SelectItem>
                              <SelectItem value="gnome">Gnome</SelectItem>
                              <SelectItem value="half-elf">Half-Elf</SelectItem>
                              <SelectItem value="half-orc">Half-Orc</SelectItem>
                              <SelectItem value="tiefling">Tiefling</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="characterClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="bg-fantasy-dark border-fantasy-charcoal">
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="barbarian">Barbarian</SelectItem>
                              <SelectItem value="bard">Bard</SelectItem>
                              <SelectItem value="cleric">Cleric</SelectItem>
                              <SelectItem value="druid">Druid</SelectItem>
                              <SelectItem value="fighter">Fighter</SelectItem>
                              <SelectItem value="monk">Monk</SelectItem>
                              <SelectItem value="paladin">Paladin</SelectItem>
                              <SelectItem value="ranger">Ranger</SelectItem>
                              <SelectItem value="rogue">Rogue</SelectItem>
                              <SelectItem value="sorcerer">Sorcerer</SelectItem>
                              <SelectItem value="warlock">Warlock</SelectItem>
                              <SelectItem value="wizard">Wizard</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="maxHp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max HP</FormLabel>
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
                    name="currentHp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current HP</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
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
                    name="armorClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Armor Class</FormLabel>
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
                </div>
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
                          placeholder="Character background, personality, etc."
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
                    onClick={() => {
                      setIsEditOpen(false);
                      setEditingCharacter(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={editCharacterMutation.isPending}
                    className="bg-fantasy-primary hover:bg-fantasy-secondary"
                  >
                    {editCharacterMutation.isPending ? "Updating..." : "Update Character"}
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
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-fantasy-dark border-fantasy-charcoal"
          />
        </div>
      </div>

      <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
            All Characters ({filteredCharacters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
          ) : filteredCharacters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCharacters.map((character: any) => (
                <CharacterCard key={character.id} character={character} onEdit={handleEdit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No characters found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm ? "Try a different search term" : "Create your first character to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

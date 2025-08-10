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
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertLocationSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MapPin,
  Plus,
  Search,
  Map,
  Building,
  Trees,
  Mountain,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CAMPAIGN_ID = 1;

export default function WorldBuilding() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["/api/campaigns", CAMPAIGN_ID, "locations"],
  });

  const form = useForm({
    resolver: zodResolver(insertLocationSchema),
    defaultValues: {
      campaignId: CAMPAIGN_ID,
      name: "",
      type: "",
      description: "",
      inhabitants: "",
      keyFeatures: "",
      notes: "",
      mapUrl: "",
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        "POST",
        `/api/campaigns/${CAMPAIGN_ID}/locations`,
        data,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/campaigns", CAMPAIGN_ID, "locations"],
      });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Location created",
        description: "The location has been added to your world.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Convert comma-separated strings to arrays
    const processedData = {
      ...data,
      inhabitants: data.inhabitants
        ? data.inhabitants
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      keyFeatures: data.keyFeatures
        ? data.keyFeatures
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
    };
    createLocationMutation.mutate(processedData);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "city":
        return <Building className="w-5 h-5" />;
      case "dungeon":
        return <Mountain className="w-5 h-5" />;
      case "wilderness":
        return <Trees className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || location.type === filterType;
    return matchesSearch && matchesType;
  });

  const locationTypes = [
    ...new Set(locations.map((l) => l.type).filter(Boolean)),
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fantasy font-bold text-fantasy-accent">
            World Building
          </h1>
          <p className="text-gray-400 mt-1">
            Manage locations and world details
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-fantasy-primary hover:bg-fantasy-secondary text-white hover-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-fantasy-slate border-fantasy-charcoal shadow-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
                Create New Location
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="bg-fantasy-dark border-fantasy-charcoal">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="city">City</SelectItem>
                              <SelectItem value="town">Town</SelectItem>
                              <SelectItem value="village">Village</SelectItem>
                              <SelectItem value="dungeon">Dungeon</SelectItem>
                              <SelectItem value="wilderness">
                                Wilderness
                              </SelectItem>
                              <SelectItem value="fortress">Fortress</SelectItem>
                              <SelectItem value="temple">Temple</SelectItem>
                              <SelectItem value="ruins">Ruins</SelectItem>
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-fantasy-dark border-fantasy-charcoal"
                          placeholder="Describe this location..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inhabitants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inhabitants (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-fantasy-dark border-fantasy-charcoal"
                          placeholder="e.g. Humans, Elves, Dwarves"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="keyFeatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Features (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-fantasy-dark border-fantasy-charcoal"
                          placeholder="e.g. Grand Library, Ancient Tower, Hidden Passages"
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
                          placeholder="Additional notes about this location..."
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
                    disabled={createLocationMutation.isPending}
                    className="bg-fantasy-primary hover:bg-fantasy-secondary"
                  >
                    {createLocationMutation.isPending
                      ? "Creating..."
                      : "Create Location"}
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
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-fantasy-dark border-fantasy-charcoal"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 bg-fantasy-dark border-fantasy-charcoal">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {locationTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
            All Locations ({filteredLocations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-6">
                    <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-20 bg-gray-700 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-700 rounded w-full"></div>
                      <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-6 hover-glow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      {getLocationIcon(location.type || "")}
                      <span className="ml-2">{location.name}</span>
                    </h3>
                    {location.type && (
                      <Badge className="bg-fantasy-primary/20 text-fantasy-accent">
                        {location.type}
                      </Badge>
                    )}
                  </div>
                  {location.description && (
                    <p className="text-gray-400 text-sm mb-4">
                      {location.description}
                    </p>
                  )}
                  {location.inhabitants && location.inhabitants.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-fantasy-accent mb-1">
                        Inhabitants:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {location.inhabitants
                          .slice(0, 3)
                          .map((inhabitant, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {inhabitant}
                            </Badge>
                          ))}
                        {location.inhabitants.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{location.inhabitants.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {location.keyFeatures && location.keyFeatures.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-fantasy-accent mb-1">
                        Key Features:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {location.keyFeatures
                          .slice(0, 2)
                          .map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        {location.keyFeatures.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{location.keyFeatures.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Map className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No locations found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || filterType !== "all"
                  ? "Try a different search term or filter"
                  : "Create your first location to start building your world"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

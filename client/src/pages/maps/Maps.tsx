import React from "react";
import { Link } from "wouter";
import { useCampaignContext } from "@/contexts/campaign-context";
import { useQuery } from "@tanstack/react-query";
import { Map } from "../../../../shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Edit, Trash2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Maps: React.FC = () => {
  const { currentCampaign, isLoading: campaignLoading } = useCampaignContext();

  const {
    data: maps = [],
    isLoading: mapsLoading,
    refetch,
    dataUpdatedAt,
  } = useQuery<Map[]>({
    queryKey: ["maps", currentCampaign?.id],
    queryFn: async () => {
      if (!currentCampaign?.id) return [];

      console.log(`🔍 Fetching maps for campaign ${currentCampaign.id}`);
      const response = await fetch(`/api/campaigns/${currentCampaign.id}/maps`);
      if (!response.ok) {
        throw new Error("Failed to fetch maps");
      }
      const data = await response.json();
      console.log(`✅ Fetched ${data.length} maps:`, data);
      return data;
    },
    enabled: !!currentCampaign?.id,
  });

  const handleDeleteMap = async (mapId: number) => {
    if (!confirm("Are you sure you want to delete this map?")) return;

    try {
      const response = await fetch(`/api/maps/${mapId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete map");
      }

      refetch();
    } catch (error) {
      console.error("Error deleting map:", error);
      alert("Failed to delete map");
    }
  };

  if (campaignLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading campaign data...</div>
      </div>
    );
  }

  if (!currentCampaign) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          No campaign selected. Please select a campaign to view maps.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-fantasy-accent">Maps</h1>
          <p className="text-gray-400 mt-1">
            Battle maps and world layouts for {currentCampaign.name}
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {new Date(dataUpdatedAt).toLocaleTimeString()} |
              Maps: {maps.length}
            </p>
          )}
        </div>
        <Link href="/maps/create">
          <Button className="bg-fantasy-accent hover:bg-fantasy-accent/80 text-fantasy-dark">
            <Plus className="w-4 h-4 mr-2" />
            Create New Map
          </Button>
        </Link>
      </div>

      {/* Maps Grid */}
      {mapsLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-fantasy-accent"></div>
          <p className="mt-2 text-gray-400">Loading maps...</p>
        </div>
      ) : maps.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No Maps Yet
          </h3>
          <p className="text-gray-400 mb-4">
            Create your first battle map to start planning encounters
          </p>
          <Link href="/maps/create">
            <Button className="bg-fantasy-accent hover:bg-fantasy-accent/80 text-fantasy-dark">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Map
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {maps.map((map) => (
            <Card
              key={map.id}
              className="bg-fantasy-slate border-fantasy-charcoal hover:border-fantasy-accent/50 transition-all"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-fantasy-accent">
                    {map.name}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Link href={`/maps/${map.id}/edit`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-2 hover:bg-fantasy-accent/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-2 hover:bg-red-500/20 text-red-400"
                      onClick={() => handleDeleteMap(map.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Map Preview */}
                <div className="aspect-square bg-fantasy-dark rounded-lg border border-fantasy-charcoal overflow-hidden">
                  <div
                    className="w-full h-full grid gap-0"
                    style={{
                      gridTemplateColumns: `repeat(${Math.min(map.width, 20)}, 1fr)`,
                      gridTemplateRows: `repeat(${Math.min(map.height, 20)}, 1fr)`,
                    }}
                  >
                    {Array.from(
                      { length: Math.min(map.width * map.height, 400) },
                      (_, i) => {
                        const row = Math.floor(i / Math.min(map.width, 20));
                        const col = i % Math.min(map.width, 20);
                        const cellKey = `${row}-${col}`;
                        const cellType =
                          (map.mapData as any)?.cells?.[cellKey] || "empty";

                        const getCellPreviewStyle = (cellType: string) => {
                          switch (cellType) {
                            case "wall":
                              return "bg-gray-600";
                            case "door":
                              return "bg-amber-600";
                            case "difficult":
                              return "bg-orange-500";
                            case "water":
                              return "bg-blue-400";
                            case "pit":
                              return "bg-gray-800";
                            default:
                              return "";
                          }
                        };

                        return (
                          <div
                            key={i}
                            className={`border-r border-b border-gray-600/20 last:border-r-0 ${getCellPreviewStyle(cellType)}`}
                            style={{
                              borderBottomWidth:
                                i >=
                                (Math.min(map.height, 20) - 1) *
                                  Math.min(map.width, 20)
                                  ? 0
                                  : 1,
                            }}
                          />
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Map Info */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Dimensions:</span>
                    <span className="text-gray-200">
                      {map.width} × {map.height}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Updated:
                    </span>
                    <span className="text-gray-200">
                      {formatDistanceToNow(
                        new Date(map.updatedAt || map.createdAt || Date.now()),
                        { addSuffix: true },
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link href={`/maps/${map.id}/edit`} className="flex-1">
                    <Button className="w-full bg-fantasy-accent/20 hover:bg-fantasy-accent/30 text-fantasy-accent border-fantasy-accent/30">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Map
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Maps;

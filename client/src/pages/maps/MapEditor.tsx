import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useCampaignContext } from "@/contexts/campaign-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Assuming MapItem, CellType, MapData, and MapItemIcon are now exported from shared/schema.ts
import {
  Map,
  InsertMap,
  MapItem,
  MapItemIcon,
  MapDataType,
  CellType,
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Save,
  Undo,
  Redo,
  Square,
  Circle,
  Shield, // For 'shield' item icon
  Mountain,
  Sword, // For 'sword' item icon
  Key, // For 'key' item icon
  FlaskConical, // For 'potion' item icon
  ScrollText, // For 'scroll' item icon
  Wand, // For 'wand' item icon
  Skull, // For 'skull' item icon
  Box, // For 'treasure_chest' item icon and 'item' tool icon
  AlertCircle, // For 'exclamation_mark' item icon
  DoorOpen, // For 'door' tool icon
  Hand, // For 'select' tool icon
  Book, // For 'book' item icon
  MapPin, // For 'map_pin' item icon
  Heart, // For 'heart' item icon
  Star, // For 'star' item icon
  X, // For 'cross' item icon
  CircleHelp, // For 'question_mark' item icon
} from "lucide-react";
import { cn } from "@/lib/utils";

// Removed local definitions for MapItem, CellType, MapData, as they are now imported from shared/schema

const MapEditor: React.FC = () => {
  const [editMatch, editParams] = useRoute("/maps/:id/edit");
  const [createMatch] = useRoute("/maps/create/new"); // Removed unused createParams
  const { currentCampaign, isLoading: campaignLoading } = useCampaignContext();
  const queryClient = useQueryClient();

  // Map state
  const [mapName, setMapName] = useState("New Map");
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(20);
  const [mapData, setMapData] = useState<MapDataType>({
    cells: {},
    characters: {},
    items: {}, // Initialize items
  });

  // Editor state
  const [selectedTool, setSelectedTool] = useState<Tool>("wall");
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<MapDataType[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [mousePressed, setMousePressed] = useState(false);

  // Item placement state
  const [isPlacingItem, setIsPlacingItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemIcon, setNewItemIcon] = useState<MapItemIcon>("treasure_chest"); // Default icon, assuming MapItemIcon is imported

  // Drawing mode state
  const [drawingMode] = useState<"click" | "drag">("drag"); // Removed unused setDrawingMode

  const mapId = editParams?.id ? parseInt(editParams.id) : null;
  const isEditing = editMatch && mapId !== null;
  const isCreating = createMatch;

  // Fetch existing map if editing
  const { data: existingMap, isLoading: mapLoading } = useQuery<Map>({
    queryKey: ["map", mapId],
    queryFn: async () => {
      const response = await fetch(`/api/maps/${mapId}`);
      if (!response.ok) throw new Error("Failed to fetch map");
      return response.json();
    },
    enabled: isEditing && !!mapId,
  });

  // Initialize map data when loading existing map
  useEffect(() => {
    if (existingMap) {
      setMapName(existingMap.name);
      setWidth(existingMap.width);
      setHeight(existingMap.height);
      // Assuming existingMap.mapData is now correctly typed as MapData
      setMapData(
        existingMap.mapData || { cells: {}, characters: {}, items: {} },
      );
      console.log(
        "Map data initialized from existing map:",
        existingMap.mapData,
      );
    }
  }, [existingMap]);

  // Save map mutation
  const saveMapMutation = useMutation<
    Map,
    Error,
    Omit<InsertMap, "campaignId">
  >({
    mutationFn: async (mapDataToSave) => {
      if (!currentCampaign?.id) {
        throw new Error("No campaign selected");
      }

      const url = isEditing
        ? `/api/maps/${mapId}`
        : `/api/campaigns/${currentCampaign.id}/maps`;

      const method = isEditing ? "PUT" : "POST";

      console.log(`🔍 Saving map with ${method} to ${url}`, mapDataToSave);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapDataToSave),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ API Error: ${response.status}`, errorData);
        throw new Error(
          `Failed to ${isEditing ? "update" : "create"} map: ${response.status}`,
        );
      }

      const result = await response.json();
      console.log(
        `Map ${isEditing ? "updated" : "created"} successfully:`,
        result,
      );
      return result;
    },
    onSuccess: (data) => {
      // Invalidate both the maps list and the individual map
      queryClient.invalidateQueries({ queryKey: ["maps"] });
      queryClient.invalidateQueries({ queryKey: ["map", mapId] });
      console.log("Invalidated individual map query:", mapId);
      console.log("Data returned from server:", data);
      const cachedMap = queryClient.getQueryData<any>(["map", mapId]);
      console.log("Cached map data BEFORE invalidation:", cachedMap);

      // Also invalidate the campaign-specific maps query
      if (currentCampaign?.id) {
        queryClient.invalidateQueries({
          queryKey: ["maps", currentCampaign.id],
        });
      }

      console.log("🔄 Cache invalidated for maps queries");
      alert(`Map ${isEditing ? "updated" : "created"} successfully!`);
    },
    onError: (error) => {
      console.error(`❌ Save mutation error:`, error);
      alert(
        `Failed to ${isEditing ? "update" : "create"} map: ${error.message}`,
      );
    },
  });

  // Updated tool definitions with distinct icons
  type Tool =
    | "select"
    | "wall"
    | "door"
    | "difficult"
    | "water"
    | "pit"
    | "eraser"
    | "item";
  const tools = [
    { id: "select", icon: Hand, label: "Select", color: "bg-blue-500" },
    { id: "wall", icon: Square, label: "Wall", color: "bg-gray-600" },
    { id: "door", icon: DoorOpen, label: "Door", color: "bg-amber-600" },
    {
      id: "difficult",
      icon: Mountain,
      label: "Difficult",
      color: "bg-orange-500",
    },
    { id: "water", icon: Circle, label: "Water", color: "bg-blue-400" },
    { id: "pit", icon: Circle, label: "Pit", color: "bg-gray-800" },
    { id: "eraser", icon: Undo, label: "Eraser", color: "bg-red-500" },
    { id: "item", icon: Box, label: "Item", color: "bg-green-500" }, // Changed to Box icon
  ] as const;

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const getCellStyle = (cellType: CellType) => {
    switch (cellType) {
      case "wall":
        return "bg-gray-600 border-gray-500";
      case "door":
        return "bg-amber-600 border-amber-500";
      case "difficult":
        return "bg-orange-500 border-orange-400";
      case "water":
        return "bg-blue-400 border-blue-300";
      case "pit":
        return "bg-gray-800 border-gray-700";
      default:
        return "bg-fantasy-dark hover:bg-fantasy-charcoal/50 border-fantasy-charcoal";
    }
  };

  // Handlers for drawing cells (only used for non-item tools with drag)
  const handleCellClick = (row: number, col: number) => {
    // This function is specifically for drag-drawing or single-click drawing of cell types.
    // Item placement has its own separate onClick logic.
    if (selectedTool === "select" || selectedTool === "item" || isPlacingItem)
      return;

    const cellKey = getCellKey(row, col);
    const newMapData = { ...mapData };

    if (selectedTool === "eraser") {
      delete newMapData.cells[cellKey];
    } else {
      newMapData.cells[cellKey] = selectedTool as CellType;
    }

    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(mapData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setMapData(newMapData);
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (
      !mousePressed ||
      !isDrawing ||
      selectedTool === "select" ||
      selectedTool === "item" ||
      isPlacingItem
    )
      return;

    const cellKey = getCellKey(row, col);
    const newMapData = { ...mapData };

    if (selectedTool === "eraser") {
      delete newMapData.cells[cellKey];
    } else {
      newMapData.cells[cellKey] = selectedTool as CellType;
    }

    setMapData(newMapData);
  };

  const handleMouseDown = (row: number, col: number) => {
    if (selectedTool === "select" || selectedTool === "item" || isPlacingItem)
      return;

    setMousePressed(true);
    setIsDrawing(true);
    handleCellClick(row, col); // Initial click for drawing
  };

  const handleMouseUp = () => {
    setMousePressed(false);
    setIsDrawing(false);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setMousePressed(false);
  };

  // Handlers for undo/redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setMapData(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setMapData(history[historyIndex + 1]);
    }
  };

  // Save the map
  const handleSave = () => {
    console.log("🔍 Preparing to save map:", {
      name: mapName,
      width,
      height,
      mapData,
      isEditing,
      mapId,
    });
    // mapData is already typed as MapData locally and assumed to be compatible with InsertMap['mapData']
    saveMapMutation.mutate({
      name: mapName,
      width,
      height,
      mapData: {
        cells: mapData.cells,
        characters: mapData.characters,
        items: mapData.items,
      },
    });
  };

  // Map item icon names to Lucide components
  const IconMap: Record<MapItemIcon, React.ElementType> = {
    treasure_chest: Box,
    door: DoorOpen,
    key: Key,
    potion: FlaskConical,
    scroll: ScrollText,
    sword: Sword,
    shield: Shield,
    wand: Wand,
    skull: Skull,
    exclamation_mark: AlertCircle,
    book: Book,
    map_pin: MapPin,
    heart: Heart,
    star: Star,
    cross: X,
    question_mark: CircleHelp,
  };

  // Render the grid cells and items
  const renderGrid = () => {
    const cellElements = [];
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const cellKey = getCellKey(row, col);
        const cellType = mapData.cells[cellKey] || "empty";

        cellElements.push(
          <div
            key={cellKey}
            className={cn(
              "aspect-square border cursor-pointer transition-colors",
              getCellStyle(cellType),
            )}
            onMouseDown={() => handleMouseDown(row, col)}
            onMouseEnter={() => handleCellMouseEnter(row, col)}
            onClick={() => {
              if (selectedTool === "item") {
                if (!isPlacingItem) {
                  // If 'item' tool is selected, and we are NOT yet in item placement mode.
                  // This click initiates the item placement, potentially showing a modal.
                  setIsPlacingItem(true);
                  setNewItemName(""); // Reset for new item
                  setNewItemIcon("treasure_chest"); // Reset to default icon
                } else {
                  // If 'item' tool is selected, AND we ARE in item placement mode.
                  // This click confirms placement of the current item at (row, col).
                  const newItem: MapItem = {
                    id: crypto.randomUUID(),
                    x: col,
                    y: row,
                    name:
                      newItemName ||
                      `Item ${Object.keys(mapData.items).length + 1}`,
                    icon: newItemIcon,
                  };

                  // Add current mapData to history BEFORE updating state for the new item
                  const newHistory = history.slice(0, historyIndex + 1);
                  newHistory.push(mapData);
                  setHistory(newHistory);
                  setHistoryIndex(newHistory.length - 1);

                  setMapData((prevMapData: MapDataType) => ({
                    ...prevMapData,
                    items: { ...prevMapData.items, [newItem.id]: newItem },
                  }));
                  setIsPlacingItem(false); // Exit item placement mode
                  setSelectedTool("select"); // Optionally switch to select tool for better UX
                }
              } else if (selectedTool === "select") {
                // Handle select tool click on a cell
                console.log(`Cell ${cellKey} selected.`);
                // Future: logic to select cell, or check if an item is here.
              }
              // For drawing tools ('wall', 'door', 'eraser', etc.), onMouseDown handles the initial click.
              // We do not want `onClick` to re-trigger drawing actions here for drawing tools.
            }}
          />,
        );
      }
    }

    // Render items as absolute overlays on top of the grid
    const itemOverlays = Object.values(mapData.items).map((item: MapItem) => {
      const IconComponent = IconMap[item.icon];
      // Calculate position relative to the grid container, centering the icon in its cell
      const cellSize = 100 / width; // Percentage width of one cell
      const itemLeft = (item.x + 0.5) * cellSize; // Center of the cell
      const itemTop = (item.y + 0.5) * cellSize; // Center of the cell

      return (
        <div
          key={`item-${item.id}`}
          className="absolute flex items-center justify-center p-1"
          style={{
            left: `${itemLeft}%`,
            top: `${itemTop}%`,
            transform: "translate(-50%, -50%)", // Center the icon precisely
            zIndex: 10, // Ensure items are rendered on top of cells
            pointerEvents: "auto", // Allow interaction with items (for future select/edit)
          }}
          title={item.name} // Show item name on hover
          onClick={(e) => {
            e.stopPropagation(); // Prevent cell click event when clicking on an item
            console.log("Clicked item:", item.name, item.id);
            // Future: Implement item editing/deletion modal
          }}
        >
          {IconComponent ? (
            <IconComponent className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
          ) : (
            <span className="text-xl text-yellow-400">❓</span> // Fallback icon
          )}
        </div>
      );
    });

    return (
      <div
        className="relative inline-block border-2 border-fantasy-accent/30 bg-fantasy-slate overflow-hidden" // Added overflow-hidden to clip items if they try to render outside
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${width}, 1fr)`,
          gridTemplateRows: `repeat(${height}, 1fr)`,
          width: "min(80vw, 800px)",
          height: "min(80vh, 800px)",
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {cellElements} {/* Render cells first */}
        {itemOverlays} {/* Render items on top */}
      </div>
    );
  };

  // Loading and error states
  if (campaignLoading || (isEditing && mapLoading)) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!currentCampaign) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          No campaign selected. Please select a campaign.
        </div>
      </div>
    );
  }

  if (!isEditing && !isCreating) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Invalid route. Please use the proper map creation or editing links.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-fantasy-accent">
            {isEditing ? "Edit Map" : "Create New Map"}
          </h1>
          <p className="text-gray-400 mt-1">
            Design battle maps for {currentCampaign.name}
          </p>
          {selectedTool === "item" && isPlacingItem && (
            <div className="mt-2 px-3 py-1 bg-fantasy-accent/20 border border-fantasy-accent/50 rounded-md">
              <span className="text-fantasy-accent text-sm font-medium">
                📌 Item Placement Mode - Click on the map to place the item.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tools Panel */}
        <Card className="bg-fantasy-slate border-fantasy-charcoal">
          <CardHeader>
            <CardTitle className="text-fantasy-accent">Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Map Settings */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Map Name</Label>
                <Input
                  id="name"
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  className="bg-fantasy-dark border-fantasy-charcoal"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value) || 20)}
                    className="bg-fantasy-dark border-fantasy-charcoal"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value) || 20)}
                    className="bg-fantasy-dark border-fantasy-charcoal"
                  />
                </div>
              </div>
            </div>

            {/* Drawing Tools */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-300">Drawing Tools</h4>
              <div className="grid grid-cols-2 gap-2">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSelectedTool(tool.id as Tool);
                        setIsPlacingItem(false); // Exit item placement mode when switching tools
                        if (drawingMode === "click") {
                          stopDrawing(); // Stop current drawing when switching tools
                        }
                      }}
                      className={cn(
                        "flex flex-col items-center p-2 h-auto",
                        selectedTool === tool.id && "border-fantasy-accent",
                      )}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Item Placement Options (shown when 'Item' tool is selected) */}
            {selectedTool === "item" && (
              <div className="space-y-2 pt-4 border-t border-fantasy-charcoal">
                <h4 className="font-semibold text-gray-300">Item Options</h4>
                <div>
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input
                    id="itemName"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g., Chest of Gold"
                    className="bg-fantasy-dark border-fantasy-charcoal"
                  />
                </div>
                <div>
                  <Label htmlFor="itemIcon">Item Icon</Label>
                  <select
                    id="itemIcon"
                    value={newItemIcon}
                    onChange={(e) =>
                      setNewItemIcon(e.target.value as MapItemIcon)
                    }
                    className="w-full p-2 rounded-md bg-fantasy-dark border border-fantasy-charcoal text-white"
                  >
                    <option value="treasure_chest">Treasure Chest</option>
                    <option value="door">Door</option>
                    <option value="key">Key</option>
                    <option value="potion">Potion</option>
                    <option value="scroll">Scroll</option>
                    <option value="sword">Sword</option>
                    <option value="shield">Shield</option>
                    <option value="wand">Wand</option>
                    <option value="skull">Skull</option>
                    <option value="exclamation_mark">Exclamation Mark</option>
                    <option value="book">Book</option>
                    <option value="map_pin">Map Pin</option>
                    <option value="heart">Heart</option>
                    <option value="star">Star</option>
                    <option value="cross">Cross</option>
                    <option value="question_mark">Question Mark</option>
                  </select>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlacingItem(false)}
                  className="w-full border-red-500 text-red-400 hover:bg-red-500/20"
                >
                  Cancel Item Placement
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-fantasy-charcoal">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="flex-1"
                >
                  <Undo className="w-4 h-4 mr-1" />
                  Undo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="flex-1"
                >
                  <Redo className="w-4 h-4 mr-1" />
                  Redo
                </Button>
              </div>
              {drawingMode === "click" && isDrawing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopDrawing}
                  className="w-full border-red-500 text-red-400 hover:bg-red-500/20"
                >
                  Stop Drawing
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={saveMapMutation.isPending || !mapName.trim()}
                className="w-full bg-fantasy-accent hover:bg-fantasy-accent/80 text-fantasy-dark"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMapMutation.isPending
                  ? "Saving..."
                  : isEditing
                    ? "Update Map"
                    : "Save Map"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map Canvas */}
        <div className="lg:col-span-3">
          <Card className="bg-fantasy-slate border-fantasy-charcoal">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-fantasy-accent">
                    {mapName} ({width} × {height})
                  </h3>
                  <p className="text-sm text-gray-400">
                    Mode:{" "}
                    {selectedTool === "item"
                      ? isPlacingItem
                        ? "Placing Item"
                        : "Item Placement"
                      : drawingMode === "click"
                        ? "Click to draw"
                        : "Click & drag to draw"}{" "}
                    | Tool: {tools.find((t) => t.id === selectedTool)?.label}
                  </p>
                </div>
                {selectedTool === "item" && isPlacingItem && (
                  <div className="animate-pulse">
                    <span className="inline-flex h-3 w-3 rounded-full bg-fantasy-accent"></span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-center">{renderGrid()}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapEditor;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SearchResults } from "@/types/campaign";
import { Search as SearchIcon, FileText, Users, CheckSquare, MapPin, StickyNote } from "lucide-react";

const CAMPAIGN_ID = 1;

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: searchResults, isLoading } = useQuery<SearchResults>({
    queryKey: ["/api/campaigns", CAMPAIGN_ID, "search", { q: searchQuery }],
    enabled: searchQuery.length >= 2,
  });

  const tabs = [
    { id: "all", label: "All Results", icon: SearchIcon },
    { id: "characters", label: "Characters", icon: Users },
    { id: "quests", label: "Quests", icon: CheckSquare },
    { id: "npcs", label: "NPCs", icon: Users },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "sessionNotes", label: "Session Notes", icon: StickyNote },
  ];

  const getTotalResults = () => {
    if (!searchResults) return 0;
    return Object.values(searchResults).reduce((total, arr) => total + arr.length, 0);
  };

  const renderCharacters = () => {
    if (!searchResults?.characters?.length) return null;
    
    return (
      <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-fantasy font-semibold text-fantasy-accent flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Characters ({searchResults.characters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchResults.characters.map((character) => (
              <div key={character.id} className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{character.name}</h3>
                  <Badge className="bg-fantasy-primary/20 text-fantasy-accent">
                    Level {character.level}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">
                  {character.race} {character.characterClass}
                </p>
                {character.notes && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{character.notes}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQuests = () => {
    if (!searchResults?.quests?.length) return null;
    
    return (
      <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-fantasy font-semibold text-fantasy-accent flex items-center">
            <CheckSquare className="w-5 h-5 mr-2" />
            Quests ({searchResults.quests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchResults.quests.map((quest) => (
              <div key={quest.id} className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{quest.title}</h3>
                  <div className="flex space-x-2">
                    {quest.priority !== 'normal' && (
                      <Badge className={
                        quest.priority === 'urgent' ? 'bg-fantasy-error/20 text-fantasy-error' :
                        quest.priority === 'high' ? 'bg-fantasy-amber/20 text-fantasy-amber' :
                        'bg-gray-500/20 text-gray-400'
                      }>
                        {quest.priority}
                      </Badge>
                    )}
                    <Badge className={
                      quest.status === 'completed' ? 'bg-fantasy-success/20 text-fantasy-success' :
                      quest.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }>
                      {quest.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                {quest.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{quest.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderNPCs = () => {
    if (!searchResults?.npcs?.length) return null;
    
    return (
      <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-fantasy font-semibold text-fantasy-accent flex items-center">
            <Users className="w-5 h-5 mr-2" />
            NPCs ({searchResults.npcs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchResults.npcs.map((npc) => (
              <div key={npc.id} className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{npc.name}</h3>
                  {npc.role && (
                    <Badge className="bg-fantasy-primary/20 text-fantasy-accent">
                      {npc.role}
                    </Badge>
                  )}
                </div>
                {npc.location && (
                  <p className="text-sm text-fantasy-amber mb-1">📍 {npc.location}</p>
                )}
                {npc.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{npc.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderLocations = () => {
    if (!searchResults?.locations?.length) return null;
    
    return (
      <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-fantasy font-semibold text-fantasy-accent flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Locations ({searchResults.locations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchResults.locations.map((location) => (
              <div key={location.id} className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{location.name}</h3>
                  {location.type && (
                    <Badge className="bg-fantasy-primary/20 text-fantasy-accent">
                      {location.type}
                    </Badge>
                  )}
                </div>
                {location.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{location.description}</p>
                )}
                {location.inhabitants && location.inhabitants.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-fantasy-accent mb-1">Inhabitants:</p>
                    <div className="flex flex-wrap gap-1">
                      {location.inhabitants.slice(0, 3).map((inhabitant, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSessionNotes = () => {
    if (!searchResults?.sessionNotes?.length) return null;
    
    return (
      <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-fantasy font-semibold text-fantasy-accent flex items-center">
            <StickyNote className="w-5 h-5 mr-2" />
            Session Notes ({searchResults.sessionNotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchResults.sessionNotes.map((note) => (
              <div key={note.id} className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">
                    Session {note.sessionNumber}
                    {note.title && `: ${note.title}`}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                {note.content && (
                  <p className="text-sm text-gray-400 line-clamp-3">{note.content}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderResults = () => {
    if (!searchResults) return null;

    const components = [
      renderCharacters(),
      renderQuests(),
      renderNPCs(),
      renderLocations(),
      renderSessionNotes(),
    ].filter(Boolean);

    if (activeTab === "all") {
      return <div className="space-y-6">{components}</div>;
    }

    switch (activeTab) {
      case "characters": return renderCharacters();
      case "quests": return renderQuests();
      case "npcs": return renderNPCs();
      case "locations": return renderLocations();
      case "sessionNotes": return renderSessionNotes();
      default: return <div className="space-y-6">{components}</div>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-fantasy font-bold text-fantasy-accent">Search</h1>
        <p className="text-gray-400 mt-1">Find anything in your campaign</p>
      </div>

      <div className="relative max-w-2xl">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search characters, quests, NPCs, locations, and session notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-lg bg-fantasy-dark border-fantasy-charcoal"
        />
      </div>

      {searchQuery.length >= 2 && (
        <>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const count = searchResults && tab.id !== "all" 
                ? searchResults[tab.id as keyof SearchResults]?.length || 0
                : getTotalResults();
                
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.id 
                      ? "bg-fantasy-primary hover:bg-fantasy-secondary text-white" 
                      : "border-fantasy-charcoal hover:bg-fantasy-primary/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {searchResults && count > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-fantasy-slate border-fantasy-charcoal shadow-card animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[...Array(2)].map((_, j) => (
                        <div key={j} className="bg-fantasy-dark/30 rounded-lg p-4">
                          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults && getTotalResults() > 0 ? (
            renderResults()
          ) : searchResults ? (
            <div className="text-center py-12">
              <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No results found</p>
              <p className="text-sm text-gray-500 mt-1">
                Try a different search term or check your spelling
              </p>
            </div>
          ) : null}
        </>
      )}

      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <div className="text-center py-12">
          <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Keep typing...</p>
          <p className="text-sm text-gray-500 mt-1">
            Enter at least 2 characters to search
          </p>
        </div>
      )}

      {searchQuery.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Start typing to search</p>
          <p className="text-sm text-gray-500 mt-1">
            Search across characters, quests, NPCs, locations, and session notes
          </p>
        </div>
      )}
    </div>
  );
}

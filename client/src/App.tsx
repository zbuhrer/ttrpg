import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CampaignProvider } from "@/contexts/campaign-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import Dashboard from "@/pages/dashboard";
import Characters from "@/pages/characters";
import StoryTimeline from "@/pages/story-timeline";
import WorldBuilding from "@/pages/world-building";
import Quests from "@/pages/quests";
import NPCs from "@/pages/npcs";
import SessionNotes from "@/pages/session-notes";
import DiceRoller from "@/pages/dice-roller";
import Search from "@/pages/search";
import { Maps, MapEditor, MapCreate } from "@/pages/maps";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto gradient-bg">
        <Header />
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/characters" component={Characters} />
          <Route path="/story-timeline" component={StoryTimeline} />
          <Route path="/world-building" component={WorldBuilding} />
          <Route path="/quests" component={Quests} />
          <Route path="/npcs" component={NPCs} />
          <Route path="/session-notes" component={SessionNotes} />
          <Route path="/dice-roller" component={DiceRoller} />
          <Route path="/search" component={Search} />
          <Route path="/maps" component={Maps} />
          <Route path="/maps/create" component={MapCreate} />
          <Route path="/maps/create/new" component={MapEditor} />
          <Route path="/maps/:id/edit" component={MapEditor} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CampaignProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </CampaignProvider>
    </QueryClientProvider>
  );
}

export default App;

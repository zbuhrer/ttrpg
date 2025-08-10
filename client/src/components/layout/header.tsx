import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuickAddModal } from "@/components/modals/quick-add-modal";
import { Plus, Play, Save } from "lucide-react";

export function Header() {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <>
      <header className="bg-fantasy-slate/90 backdrop-blur-sm border-b border-fantasy-charcoal px-6 py-4 sticky top-0 z-10 arcane-shimmer">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-fantasy font-semibold text-fantasy-accent mystical-glow">
              ⚔️ The Shattered Crown ⚔️
            </h2>
            <p className="text-gray-400 text-sm mt-1 font-manuscript">
              Campaign Dashboard • Session 12 • 4 Active Players
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setIsQuickAddOpen(true)}
              className="px-4 py-2 bg-fantasy-primary hover:bg-fantasy-secondary text-white rounded-lg transition-colors duration-300 hover-glow mystical-glow font-manuscript"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Add
            </Button>
            <Button className="px-4 py-2 bg-fantasy-success hover:bg-green-600 text-white rounded-lg transition-colors duration-300 hover-glow mystical-glow font-manuscript">
              <Play className="w-4 h-4 mr-2" />
              Start Session
            </Button>
            <div className="text-gray-400 flex items-center">
              <Save className="w-4 h-4 mr-1" />
              <span className="text-xs">Auto-saved 2min ago</span>
            </div>
          </div>
        </div>
      </header>

      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
      />
    </>
  );
}

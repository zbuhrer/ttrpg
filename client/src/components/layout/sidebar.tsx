import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, Users, Scroll, Map, CheckSquare, 
  UserCircle, StickyNote, Dice6, Search 
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navigation = [
    {
      title: "Campaign",
      items: [
        { name: "Dashboard", href: "/", icon: Home },
        { name: "Characters", href: "/characters", icon: Users },
        { name: "Story & Timeline", href: "/story-timeline", icon: Scroll },
        { name: "World Building", href: "/world-building", icon: Map },
      ]
    },
    {
      title: "Management",
      items: [
        { name: "Quests", href: "/quests", icon: CheckSquare },
        { name: "NPCs", href: "/npcs", icon: UserCircle },
        { name: "Session Notes", href: "/session-notes", icon: StickyNote },
      ]
    },
    {
      title: "Tools",
      items: [
        { name: "Dice Roller", href: "/dice-roller", icon: Dice6 },
        { name: "Search", href: "/search", icon: Search },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-fantasy-slate border-r border-fantasy-charcoal flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-fantasy-charcoal">
        <h1 className="text-2xl font-fantasy font-bold text-fantasy-accent flex items-center">
          <span className="mr-2">✨</span>
          Aetherquill
        </h1>
        <p className="text-sm text-gray-400 mt-1">Campaign Scribe</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scroll-hidden">
        {navigation.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-3 px-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer",
                        isActive
                          ? "text-fantasy-accent bg-fantasy-primary/20 border border-fantasy-accent/30 hover-glow mystical-glow"
                          : "text-gray-300 hover:text-fantasy-accent hover:bg-fantasy-primary/10 arcane-shimmer"
                      )}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-fantasy-charcoal">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-fantasy-accent rounded-full flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-fantasy-dark" />
          </div>
          <div>
            <p className="text-sm font-medium">Dungeon Master</p>
            <p className="text-xs text-gray-400">dm@mythweaver.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

import { Character } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface CharacterCardProps {
  character: Character;
  onEdit?: (character: Character) => void;
}

export function CharacterCard({ character, onEdit }: CharacterCardProps) {
  const hpPercentage = (character.maxHp ?? 0) > 0 ? ((character.currentHp ?? 0) / (character.maxHp ?? 1)) * 100 : 0;
  const xpPercentage = (character.xpToNextLevel ?? 0) > 0 ? ((character.currentXp ?? 0) / (character.xpToNextLevel ?? 1)) * 100 : 0;

  const getHpColor = (percentage: number) => {
    if (percentage > 75) return "bg-fantasy-success";
    if (percentage > 25) return "bg-fantasy-amber";
    return "bg-fantasy-error";
  };

  return (
    <div className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-4 hover-glow relative">
      {onEdit && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(character)}
          className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-fantasy-charcoal/50"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      <div className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-fantasy-accent bg-fantasy-charcoal flex items-center justify-center">
        <span className="text-2xl">👤</span>
      </div>
      <div className="text-center">
        <h4 className="font-semibold text-white">{character.name}</h4>
        <p className="text-sm text-gray-400">
          {character.race} {character.characterClass}
        </p>
        <p className="text-xs text-fantasy-accent mt-1">Level {character.level}</p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">HP</span>
          <span className="text-white">
            {character.currentHp}/{character.maxHp}
          </span>
        </div>
        <Progress 
          value={hpPercentage} 
          className={`h-2 ${getHpColor(hpPercentage)}`}
        />
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">XP</span>
          <span className="text-white">
            {character.currentXp}/{character.xpToNextLevel}
          </span>
        </div>
        <Progress 
          value={xpPercentage} 
          className="h-2 bg-fantasy-accent"
        />
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { DiceRoll } from "@/types/campaign";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

export function DiceRollerWidget() {
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = async (sides: number) => {
    setIsRolling(true);
    try {
      const response = await apiRequest("POST", "/api/dice/roll", { sides, count: 1 });
      const rollResult = await response.json();
      setLastRoll(rollResult);
    } catch (error) {
      console.error("Failed to roll dice:", error);
    } finally {
      setIsRolling(false);
    }
  };

  const diceOptions = [
    { sides: 20, icon: Dice1, label: "d20" },
    { sides: 6, icon: Dice2, label: "d6" },
    { sides: 12, icon: Dice3, label: "d12" },
    { sides: 100, icon: Dice4, label: "d100" },
  ];

  return (
    <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
      <CardHeader className="border-b border-fantasy-charcoal">
        <CardTitle className="text-lg font-fantasy font-semibold text-fantasy-accent">
          Quick Dice Roll
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {diceOptions.map(({ sides, icon: Icon, label }) => (
            <Button
              key={sides}
              onClick={() => rollDice(sides)}
              disabled={isRolling}
              className="p-3 bg-fantasy-primary hover:bg-fantasy-secondary rounded-lg text-center transition-colors duration-300 hover-glow"
            >
              <div className="flex flex-col items-center">
                <Icon className="text-xl text-fantasy-accent mb-1" />
                <span className="text-xs">{label}</span>
              </div>
            </Button>
          ))}
        </div>
        <div className="p-4 bg-fantasy-dark rounded-lg border border-fantasy-charcoal">
          <div className="text-center">
            <p className={`text-2xl font-bold text-fantasy-accent ${isRolling ? 'animate-pulse' : ''}`}>
              {isRolling ? '...' : lastRoll?.total || '?'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {lastRoll ? `Last roll: d${lastRoll.sides}` : 'Roll a die'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

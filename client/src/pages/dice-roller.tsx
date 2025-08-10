import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { DiceRoll } from "@/types/campaign";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, Plus, Minus } from "lucide-react";

const diceTypes = [
  { sides: 4, label: "d4", icon: Dice1 },
  { sides: 6, label: "d6", icon: Dice2 },
  { sides: 8, label: "d8", icon: Dice3 },
  { sides: 10, label: "d10", icon: Dice4 },
  { sides: 12, label: "d12", icon: Dice5 },
  { sides: 20, label: "d20", icon: Dice6 },
  { sides: 100, label: "d100", icon: Dice1 },
];

export default function DiceRoller() {
  const [selectedDice, setSelectedDice] = useState(20);
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = async () => {
    setIsRolling(true);
    try {
      const response = await apiRequest("POST", "/api/dice/roll", { 
        sides: selectedDice, 
        count: diceCount, 
        modifier 
      });
      const rollResult: DiceRoll = await response.json();
      setLastRoll(rollResult);
      setRollHistory(prev => [rollResult, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error("Failed to roll dice:", error);
    } finally {
      setIsRolling(false);
    }
  };

  const quickRoll = async (sides: number) => {
    setIsRolling(true);
    try {
      const response = await apiRequest("POST", "/api/dice/roll", { 
        sides, 
        count: 1, 
        modifier: 0 
      });
      const rollResult: DiceRoll = await response.json();
      setLastRoll(rollResult);
      setRollHistory(prev => [rollResult, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error("Failed to roll dice:", error);
    } finally {
      setIsRolling(false);
    }
  };

  const adjustCount = (delta: number) => {
    setDiceCount(Math.max(1, Math.min(10, diceCount + delta)));
  };

  const adjustModifier = (delta: number) => {
    setModifier(Math.max(-20, Math.min(20, modifier + delta)));
  };

  const clearHistory = () => {
    setRollHistory([]);
    setLastRoll(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fantasy font-bold text-fantasy-accent">Dice Roller</h1>
          <p className="text-gray-400 mt-1">Roll dice for your D&D sessions</p>
        </div>
        <Button 
          onClick={clearHistory}
          variant="outline"
          className="border-fantasy-charcoal hover:bg-fantasy-primary/10"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear History
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Roll Buttons */}
        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
              Quick Roll
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {diceTypes.map(({ sides, label, icon: Icon }) => (
                <Button
                  key={sides}
                  onClick={() => quickRoll(sides)}
                  disabled={isRolling}
                  className="p-4 bg-fantasy-primary hover:bg-fantasy-secondary rounded-lg text-center transition-colors duration-300 hover-glow h-auto"
                >
                  <div className="flex flex-col items-center">
                    <Icon className="w-6 h-6 text-fantasy-accent mb-2" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Roll */}
        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
              Custom Roll
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-fantasy-accent">Dice Type</Label>
              <Select value={selectedDice.toString()} onValueChange={(value) => setSelectedDice(parseInt(value))}>
                <SelectTrigger className="bg-fantasy-dark border-fantasy-charcoal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {diceTypes.map(({ sides, label }) => (
                    <SelectItem key={sides} value={sides.toString()}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-fantasy-accent">Number of Dice</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adjustCount(-1)}
                  disabled={diceCount <= 1}
                  className="border-fantasy-charcoal"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={diceCount}
                  onChange={(e) => setDiceCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-20 text-center bg-fantasy-dark border-fantasy-charcoal"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adjustCount(1)}
                  disabled={diceCount >= 10}
                  className="border-fantasy-charcoal"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-fantasy-accent">Modifier</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adjustModifier(-1)}
                  disabled={modifier <= -20}
                  className="border-fantasy-charcoal"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  min="-20"
                  max="20"
                  value={modifier}
                  onChange={(e) => setModifier(Math.max(-20, Math.min(20, parseInt(e.target.value) || 0)))}
                  className="w-20 text-center bg-fantasy-dark border-fantasy-charcoal"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adjustModifier(1)}
                  disabled={modifier >= 20}
                  className="border-fantasy-charcoal"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={rollDice}
              disabled={isRolling}
              className="w-full bg-fantasy-primary hover:bg-fantasy-secondary text-white hover-glow py-3"
            >
              {isRolling ? "Rolling..." : `Roll ${diceCount}d${selectedDice}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`}
            </Button>
          </CardContent>
        </Card>

        {/* Current Result */}
        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
              Current Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              <div className={`text-6xl font-bold text-fantasy-accent mb-4 ${isRolling ? 'animate-pulse' : ''}`}>
                {isRolling ? '?' : lastRoll?.total || '—'}
              </div>
              {lastRoll && !isRolling && (
                <div className="space-y-2">
                  <p className="text-lg text-white">
                    {lastRoll.count}d{lastRoll.sides}
                    {lastRoll.modifier !== 0 && (lastRoll.modifier > 0 ? ` + ${lastRoll.modifier}` : ` - ${Math.abs(lastRoll.modifier)}`)}
                  </p>
                  {lastRoll.rolls.length > 1 && (
                    <p className="text-sm text-gray-400">
                      Rolls: [{lastRoll.rolls.join(', ')}]
                      {lastRoll.modifier !== 0 && ` ${lastRoll.modifier > 0 ? '+' : ''}${lastRoll.modifier}`}
                    </p>
                  )}
                </div>
              )}
              {!lastRoll && !isRolling && (
                <p className="text-gray-400">Roll some dice to see results</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roll History */}
      {rollHistory.length > 0 && (
        <Card className="bg-fantasy-slate border-fantasy-charcoal shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-fantasy font-semibold text-fantasy-accent">
              Roll History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {rollHistory.map((roll, index) => (
                <div key={index} className="bg-fantasy-dark/30 rounded-lg border border-fantasy-charcoal/50 p-4 text-center">
                  <div className="text-2xl font-bold text-fantasy-accent mb-2">
                    {roll.total}
                  </div>
                  <div className="text-sm text-gray-400">
                    {roll.count}d{roll.sides}
                    {roll.modifier !== 0 && (roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier)}
                  </div>
                  {roll.rolls.length > 1 && (
                    <div className="text-xs text-gray-500 mt-1">
                      [{roll.rolls.join(', ')}]
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

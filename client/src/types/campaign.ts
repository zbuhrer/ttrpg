export interface DiceRoll {
  rolls: number[];
  modifier: number;
  total: number;
  sides: number;
  count: number;
}

export interface SearchResults {
  characters: any[];
  quests: any[];
  npcs: any[];
  locations: any[];
  sessionNotes: any[];
}

from dataclasses import dataclass
from typing import Dict, List, Any
from datetime import datetime


@dataclass
class GameState:
    """Represents the current state of the game."""
    location: str
    time: datetime
    weather: str
    environmental_effects: List[str]
    active_quests: List[str]
    recent_events: List[Dict[str, Any]]


@dataclass
class Character:
    """Represents a character's current state."""
    name: str
    status: Dict[str, Any]
    current_actions: List[str]
    recent_events: List[str]
    stats: Dict[str, int]
    inventory: List[Dict[str, Any]]

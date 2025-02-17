from dataclasses import dataclass
from typing import List, Optional, Dict


@dataclass
class Combatant:
    """Represents a single combatant in the initiative order."""
    name: str
    initiative: int
    hp: int
    max_hp: int
    ac: int
    stats: Dict[str, int]
    status_effects: List[str] = None
    is_player: bool = False

    def __post_init__(self):
        if self.status_effects is None:
            self.status_effects = []

    def take_damage(self, amount: int) -> None:
        self.hp = max(0, self.hp - amount)

    def heal(self, amount: int) -> None:
        self.hp = min(self.max_hp, self.hp + amount)

    def add_status_effect(self, effect: str) -> None:
        if effect not in self.status_effects:
            self.status_effects.append(effect)

    def remove_status_effect(self, effect: str) -> None:
        if effect in self.status_effects:
            self.status_effects.remove(effect)


class InitiativeTracker:
    """Manages initiative order and turn tracking for combat encounters."""

    def __init__(self):
        self._combatants: List[Combatant] = []
        self._current_index: int = 0
        self._round: int = 1
        self._combat_log: List[str] = []

    def add_combatant(self, name: str, initiative: int, hp: int, ac: int,
                      stats: Dict[str, int], is_player: bool = False) -> None:
        """
        Add a new combatant to the initiative order.

        Args:
            name: The combatant's name
            initiative: Their initiative roll
            hp: Hit points
            ac: Armor class
            stats: Dictionary of ability scores
            is_player: Whether this is a player character
        """
        new_combatant = Combatant(
            name=name,
            initiative=initiative,
            hp=hp,
            max_hp=hp,
            ac=ac,
            stats=stats,
            is_player=is_player
        )
        self._combatants.append(new_combatant)
        self._combatants.sort(key=lambda x: x.initiative, reverse=True)
        self._log_event(
            f"{name} joins the battle with initiative {initiative}!")

    def get_current_combatant(self) -> Optional[Combatant]:
        """Return the combatant whose turn it currently is."""
        if not self._combatants:
            return None
        return self._combatants[self._current_index]

    def next_turn(self) -> Optional[Combatant]:
        """
        Advance to the next turn in initiative order.

        Returns:
            The next combatant in the order, or None if combat is empty
        """
        if not self._combatants:
            return None

        self._current_index += 1
        if self._current_index >= len(self._combatants):
            self._current_index = 0
            self._round += 1

        return self.get_current_combatant()

    def get_round(self) -> int:
        """Return the current combat round number."""
        return self._round

    def clear(self) -> None:
        """Reset the initiative tracker to its initial state."""
        self._combatants = []
        self._current_index = 0
        self._round = 1
        self._combat_log = []

    def get_all_combatants(self) -> List[Combatant]:
        """Return a list of all combatants in initiative order."""
        return self._combatants.copy()

    def _log_event(self, message: str) -> None:
        """Add an event to the combat log"""
        self._combat_log.append(f"Round {self._round}: {message}")

    def get_combat_log(self) -> List[str]:
        """Return the combat log history"""
        return self._combat_log.copy()

    def resolve_attack(self, attacker: str, target: str, attack_roll: int, damage: int) -> str:
        """Resolve an attack between combatants"""
        attacking_combatant = next(
            (c for c in self._combatants if c.name == attacker), None)
        target_combatant = next(
            (c for c in self._combatants if c.name == target), None)

        if not attacking_combatant or not target_combatant:
            return "Invalid combatant name!"

        if attack_roll >= target_combatant.ac:
            target_combatant.take_damage(damage)
            message = f"{attacker} hits {target} for {damage} damage!"
            if target_combatant.hp <= 0:
                message += f" {target} has been defeated!"
                self.remove_combatant(target)
        else:
            message = f"{attacker} misses {target}!"

        self._log_event(message)
        return message

    def remove_combatant(self, name: str) -> None:
        """Remove a combatant from the battle"""
        self._combatants = [c for c in self._combatants if c.name != name]
        if self._current_index >= len(self._combatants):
            self._current_index = 0

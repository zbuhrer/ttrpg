from dataclasses import dataclass
from typing import List, Optional, Dict


@dataclass
class StatusEffect:
    """Represents a single status effect."""
    name: str
    duration: int
    application_source: str
    scaling: str
    removal_method: str


@dataclass
class Combatant:
    """Represents a single combatant in the initiative order."""
    name: str
    initiative: int
    hp: int
    max_hp: int
    ac: int
    stats: Dict[str, int]
    status_effects: List[StatusEffect] = None
    is_player: bool = False

    def __post_init__(self):
        if self.status_effects is None:
            self.status_effects = []

    def take_damage(self, amount: int) -> None:
        self.hp = max(0, self.hp - amount)

    def heal(self, amount: int) -> None:
        self.hp = min(self.max_hp, self.hp + amount)

    def add_status_effect(self, effect: StatusEffect) -> None:
        self.status_effects.append(effect)

    def remove_status_effect(self, effect_name: str) -> None:
        self.status_effects = [
            effect for effect in self.status_effects if effect.name != effect_name]


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

        # Resolve status effects for current combatant before turn ends
        current_combatant = self.get_current_combatant()
        if current_combatant:
            self.resolve_end_of_turn_status_effects(current_combatant)

        self._current_index += 1
        if self._current_index >= len(self._combatants):
            self._current_index = 0
            self._round += 1

        # Apply status effects for next combatant at start of turn
        next_combatant = self.get_current_combatant()
        if next_combatant:
            self.apply_start_of_turn_status_effects(next_combatant)

        return next_combatant

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

        # Apply status effects that might affect the attack roll
        attack_roll = self.modify_attack_roll_with_status_effects(
            attacking_combatant, target_combatant, attack_roll)

        if attack_roll >= target_combatant.ac:
            # Apply status effects that might affect the damage
            damage = self.modify_damage_with_status_effects(
                attacking_combatant, target_combatant, damage)

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

    def apply_status_effect(self, target: str, effect: StatusEffect) -> str:
        """Apply a status effect to a combatant."""
        target_combatant = next(
            (c for c in self._combatants if c.name == target), None)

        if not target_combatant:
            return "Invalid combatant name!"

        target_combatant.add_status_effect(effect)
        message = f"{target} is afflicted with {effect.name}!"
        self._log_event(message)
        return message

    def remove_status_effect(self, target: str, effect_name: str) -> str:
        """Remove a status effect from a combatant."""
        target_combatant = next(
            (c for c in self._combatants if c.name == target), None)

        if not target_combatant:
            return "Invalid combatant name!"

        target_combatant.remove_status_effect(effect_name)
        message = f"{target} is no longer {effect_name}!"
        self._log_event(message)
        return message

    def apply_start_of_turn_status_effects(self, combatant: Combatant) -> None:
        """Apply status effects that trigger at the start of the turn."""
        for effect in combatant.status_effects:
            if effect.name == "Poisoned":
                # Apply disadvantage to attack rolls and ability checks
                self._log_event(
                    f"{combatant.name} suffers from Poisoned! Applying disadvantage to attack rolls and ability checks.")
            elif effect.name == "Burning":
                # Apply damage
                damage = 5  # Example damage value
                combatant.take_damage(damage)
                self._log_event(
                    f"{combatant.name} suffers {damage} burning damage!")

    def resolve_end_of_turn_status_effects(self, combatant: Combatant) -> None:
        """Resolve status effects that trigger at the end of the turn (e.g., reduce duration)."""
        effects_to_remove = []
        for effect in combatant.status_effects:
            effect.duration -= 1
            if effect.duration <= 0:
                effects_to_remove.append(effect.name)

        for effect_name in effects_to_remove:
            self.remove_status_effect(combatant.name, effect_name)

    def modify_attack_roll_with_status_effects(self, attacker: Combatant, target: Combatant, attack_roll: int) -> int:
        """Modify the attack roll based on relevant status effects."""
        for effect in attacker.status_effects:
            if effect.name == "Inspired":
                attack_roll += 5  # Example bonus to attack roll
                self.remove_status_effect(attacker.name, "Inspired")
                self._log_event(
                    f"{attacker.name} is Inspired! Gaining +5 to the attack roll.")

        for effect in target.status_effects:
            if effect.name == "Weakened":
                attack_roll -= 2  # Example penalty to attack roll
                self._log_event(
                    f"{target.name} is Weakened! Applying -2 penalty to the attack roll against them.")

        return attack_roll

    def modify_damage_with_status_effects(self, attacker: Combatant, target: Combatant, damage: int) -> int:
        """Modify the damage based on relevant status effects."""
        for effect in attacker.status_effects:
            if effect.name == "Enraged":
                damage += 3  # Example bonus to damage
                self._log_event(
                    f"{attacker.name} is Enraged! Dealing +3 damage.")

        for effect in target.status_effects:
            if effect.name == "Weakened":
                damage -= 1  # Example penalty to damage
                self._log_event(
                    f"{target.name} is Weakened! Reducing damage taken by 1.")

        return damage

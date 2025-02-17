import pytest
from app.services.combat_system import InitiativeTracker, Combatant


def test_add_single_combatant():
    tracker = InitiativeTracker()
    tracker.add_combatant("Fighter", 15)
    
    current = tracker.get_current_combatant()
    assert current is not None
    assert current.name == "Fighter"
    assert current.initiative == 15

def test_initiative_order():
    tracker = InitiativeTracker()
    tracker.add_combatant("Slow", 10)
    tracker.add_combatant("Fast", 20)
    tracker.add_combatant("Medium", 15)
    
    combatants = tracker.get_all_combatants()
    assert len(combatants) == 3
    assert combatants[0].name == "Fast"
    assert combatants[1].name == "Medium"
    assert combatants[2].name == "Slow"

def test_next_turn():
    tracker = InitiativeTracker()
    tracker.add_combatant("A", 20)
    tracker.add_combatant("B", 15)
    
    assert tracker.get_current_combatant().name == "A"
    assert tracker.next_turn().name == "B"
    assert tracker.next_turn().name == "A"

def test_round_tracking():
    tracker = InitiativeTracker()
    tracker.add_combatant("A", 20)
    tracker.add_combatant("B", 15)
    
    assert tracker.get_round() == 1
    tracker.next_turn()  # to B
    assert tracker.get_round() == 1
    tracker.next_turn()  # back to A, new round
    assert tracker.get_round() == 2

def test_empty_tracker():
    tracker = InitiativeTracker()
    assert tracker.get_current_combatant() is None
    assert tracker.next_turn() is None
    assert tracker.get_round() == 1

def test_clear_tracker():
    tracker = InitiativeTracker()
    tracker.add_combatant("A", 20)
    tracker.add_combatant("B", 15)
    
    tracker.next_turn()
    tracker.clear()
    
    assert tracker.get_current_combatant() is None
    assert tracker.get_round() == 1
    assert len(tracker.get_all_combatants()) == 0


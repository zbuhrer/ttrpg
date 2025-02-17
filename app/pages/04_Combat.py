import streamlit as st
import random
from app.services.combat_system import InitiativeTracker
from app.services.game_state import GameStateManager


def initialize_combat():
    if 'game_state' not in st.session_state:
        st.session_state.game_state = {
            'combat': {
                'active': False,
                'initiative_tracker': InitiativeTracker()
            }
        }


def roll_dice(num_dice: int, sides: int) -> int:
    return sum(random.randint(1, sides) for _ in range(num_dice))


def combat_page():
    initialize_combat()
    game_state = GameStateManager()

    if st.session_state.game_state['combat']['active']:
        tracker = st.session_state.game_state['combat']['initiative_tracker']
    else:
        tracker = InitiativeTracker()
        st.session_state.game_state['combat']['initiative_tracker'] = tracker

    st.title("⚔️ Combat Arena")

    # Combat Controls
    if st.button("Start New Combat", key="start_combat"):
        st.session_state.game_state['combat']['active'] = True
        tracker.clear()
        game_state.start_combat(st.session_state.get('char_id'))

    # Add Combatant Form
    with st.form("add_combatant"):
        name = st.text_input("Name")
        is_player = st.checkbox("Is Player Character?")

        # Auto-roll initiative or manual entry
        auto_roll = st.checkbox("Auto-roll Initiative")
        if auto_roll:
            initiative = roll_dice(1, 20)
            st.write(f"Initiative Roll: {initiative}")
        else:
            initiative = st.number_input(
                "Initiative", min_value=1, max_value=30)

        # Basic stats
        hp = st.number_input("HP", min_value=1, value=20)
        ac = st.number_input("Armor Class", min_value=1, value=15)

        stats = {
            "strength": st.number_input("Strength", min_value=1, max_value=20, value=10),
            "dexterity": st.number_input("Dexterity", min_value=1, max_value=20, value=10),
            "constitution": st.number_input("Constitution", min_value=1, max_value=20, value=10)
        }

        if st.form_submit_button("Add to Combat"):
            tracker.add_combatant(name, initiative, hp, ac, stats, is_player)
            game_state.add_combatant(
                st.session_state.get('char_id'),
                name,
                initiative
            )

    # Active Combat Interface
    if st.session_state.game_state['combat']['active']:
        st.header(f"Round {tracker.get_round()}")
        current = tracker.get_current_combatant()

        if current:
            st.subheader(f"Current Turn: {current.name}")
            col1, col2 = st.columns(2)

            with col1:
                st.markdown("### Actions")
                action = st.selectbox(
                    "Choose Action", ["Attack", "Heal", "Use Item"])

                if action == "Attack":
                    target = st.selectbox(
                        "Target",
                        [c.name for c in tracker.get_all_combatants() if c.name !=
                         current.name]
                    )

                    if st.button("Roll Attack"):
                        attack_roll = roll_dice(1, 20)
                        damage = roll_dice(1, 8)
                        result = tracker.resolve_attack(
                            current.name, target, attack_roll, damage)
                        st.write(result)

                elif action == "Heal":
                    heal_amount = st.number_input(
                        "Healing Amount", min_value=1, value=5)
                    if st.button("Apply Healing"):
                        current.heal(heal_amount)
                        tracker._log_event(f"{current.name} heals for {
                                           heal_amount} HP!")

            with col2:
                st.markdown("### Combat Log")
                for entry in tracker.get_combat_log()[-5:]:
                    st.text(entry)

            # Next Turn Button
            if st.button("End Turn"):
                next_combatant = tracker.next_turn()
                if next_combatant:
                    st.write(f"Next up: {next_combatant.name}")

    # Display Initiative Order
    st.subheader("Initiative Order")
    for combatant in tracker.get_all_combatants():
        st.text(f"{combatant.name}: {combatant.initiative}")

    # End Combat Button
    if st.button("End Combat"):
        st.session_state.game_state['combat']['active'] = False
        tracker.clear()
        game_state.end_combat(st.session_state.get('char_id'))
        st.experimental_rerun()


if __name__ == "__main__":
    combat_page()

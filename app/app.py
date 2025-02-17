import streamlit as st

import requests
from typing import Dict, List
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv
from requests.exceptions import RequestException

from config import OLLAMA_ENDPOINT, THEME


def ollama_connection() -> bool:
    """Check if Ollama endpoint is accessible"""
    try:
        # Simple health check - just trying to connect
        response = requests.get(
            OLLAMA_ENDPOINT.replace('/api/generate', '/api/tags'))
        return response.status_code == 200
    except RequestException:
        return False


@dataclass
class Character:
    name: str
    race: str
    class_type: str
    background: str
    inventory: List[str]
    stats: Dict[str, int]


@dataclass
class GameState:
    session_id: str
    turn_number: int
    party: List[Character]
    narrative_history: List[str]
    current_scene: str
    active_quests: List[str]


# --- Core Configuration ---
load_dotenv()

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
SAVES_DIR = DATA_DIR / "saves"
ASSETS_DIR = DATA_DIR / "assets"

# Ensure our directory structure exists
for dir in [DATA_DIR, SAVES_DIR, ASSETS_DIR]:
    dir.mkdir(parents=True, exist_ok=True)

# --- UI Configuration ---
st.set_page_config(
    page_title="Aetherquill",
    page_icon="⚔️",
    layout="wide",
    initial_sidebar_state="collapsed"
)


def setup_ui_theme():
    """Configure custom UI theme and styling"""
    st.markdown(THEME, unsafe_allow_html=True)


def initialize_game_state():
    if 'game_state' not in st.session_state:
        st.session_state.game_state = {
            'combat': {
                'active': False,
                'initiative_tracker': None,
                'combat_log': []
            }
        }


def main():
    setup_ui_theme()
    initialize_game_state()

    render_hero_section()
    render_main_menu()
    render_quick_actions()

    st.markdown("---")
    st.markdown("""
        <div class="footer">
            <p>Aetherquill v0.1 - <a href="https://github.com/zbuhrer/ttrpg">GitHub</a></p>
        </div>
    """, unsafe_allow_html=True)


def render_hero_section():
    """Render the main hero section with title and tagline"""
    st.markdown("""
        <div class="hero-section">
            <h1>⚔️ Aetherquill</h1>
        </div>
    """, unsafe_allow_html=True)


def render_main_menu():
    """Render the main menu options"""
    col1, col2 = st.columns(2)

    with col1:
        # New Story Flow
        if st.button("Continue", key="continue"):
            if 'character' not in st.session_state:
                st.switch_page("pages/01_Character_Creation.py")
            else:
                st.switch_page("pages/02_Active_Quest.py")

        # New Character Flow
        if st.button("New Character", key="new_char"):
            if 'character' not in st.session_state:
                st.switch_page("pages/01_Character_Creation.py")

        # Load Story
        if st.button("Load Story", key="load"):
            # TODO: Implement save/load system
            st.info("Save/Load system coming soon!")

    with col2:
        st.markdown("""
            ### Current Quest
        """)

        if 'character' in st.session_state and isinstance(st.session_state['character'], dict):
            char = st.session_state['character']
            if all(key in char for key in ['name', 'race', 'class_type']):
                st.markdown(f"""
                    **{char['name']}**
                    *Level 1 {char['race']} {char['class_type']}*

                    Current Location: Mistwood Tavern
                    Active Quest: The Call to Adventure
                """)
            else:
                st.markdown(
                    "*Character data incomplete. Please create a new character.*")
        else:
            st.markdown("""
                *No active quest found.*
            """)


def render_quick_actions():
    """Render quick action buttons"""
    st.markdown("---")
    cols = st.columns(4)

    # Check if we have an active character
    has_active_character = 'character' in st.session_state and isinstance(
        st.session_state['character'], dict)

    with cols[0]:
        st.button("⚔️ Combat",
                  key="combat",
                  disabled=not has_active_character,
                  on_click=lambda: st.switch_page("pages/04_Combat.py") if has_active_character else None)

    with cols[1]:
        st.button("🗺️ World Map",
                  key="map",
                  disabled=not has_active_character,
                  on_click=lambda: st.info("World Map coming soon!") if has_active_character else None)

    with cols[2]:
        st.button("🎭 Character",
                  key="character",
                  on_click=lambda: st.switch_page("pages/01_Character_Creation.py"))


    with cols[3]:
        st.button("⚙️ Settings",
                  key="settings",
                  on_click=lambda: st.switch_page("pages/03_Settings.py"))


if __name__ == "__main__":
    main()

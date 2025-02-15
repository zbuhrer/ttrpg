import streamlit as st
import os
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

import requests
from requests.exceptions import RequestException


def ollama_connection() -> bool:
    """Check if Ollama endpoint is accessible"""
    try:
        # Simple health check - just trying to connect
        response = requests.get(
            OLLAMA_ENDPOINT.replace('/api/generate', '/api/tags'))
        return response.status_code == 200
    except RequestException:
        return False


def ollama_models() -> bool:
    """Check if Ollama models are available"""
    try:
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

OLLAMA_ENDPOINT = os.getenv(
    'OLLAMA_ENDPOINT', 'http://localhost:11434/api/generate')
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
SAVES_DIR = DATA_DIR / "saves"
ASSETS_DIR = DATA_DIR / "assets"

# Ensure our directory structure exists
for dir in [DATA_DIR, SAVES_DIR, ASSETS_DIR]:
    dir.mkdir(parents=True, exist_ok=True)

# --- UI Configuration ---
st.set_page_config(
    page_title="Echoes of Elysium",
    page_icon="⚔️",
    layout="wide",
    initial_sidebar_state="expanded"
)


def setup_ui_theme():
    """Configure custom UI theme and styling"""
    st.markdown("""
        <style>
        /* Custom Theme Elements */
        .stApp {
            background-image: linear-gradient(45deg, #1a1a2e, #16213e);
            color: #e0e0e0;
        }

        .stButton>button {
            background-color: #4a0e0e;
            color: #ffd700;
            border: 2px solid #8b0000;
            border-radius: 5px;
            transition: all 0.3s ease;
        }

        .stButton>button:hover {
            background-color: #8b0000;
            border-color: #ffd700;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        /* Header Styling */
        h1, h2, h3 {
            font-family: 'Cinzel', serif;
            color: #ffd700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet">
    """, unsafe_allow_html=True)


def main():
    setup_ui_theme()

    header_col1, header_col2 = st.columns([6, 1])
    with header_col1:
        st.title("⚔️ Echoes of Elysium")

    with header_col2:
        ollama_status = ollama_connection()
        status_icon = "🟢" if ollama_status else "🔴"
        st.markdown(f"""
            <div style='text-align: right; padding-top: 1rem;'>
                <span title='Ollama Connection Status'>Ollama: {status_icon}</span>
            </div>
        """, unsafe_allow_html=True)

    # Initialize session state if needed
    if 'game_state' not in st.session_state:
        st.session_state.game_state = None

    # Main Content (Tavern/Home)
    render_home_page()


def render_home_page():
    st.header("Welcome to the Tavern")

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("""
        ### Begin Your Journey
        Choose your path, brave adventurer:
        """)

        if st.button("🎭 Create New Character"):
            st.switch_page("pages/01_Character_Creation.py")

        if st.button("🗺️ Start New Quest"):
            st.switch_page("pages/02_Active_Quest.py")

        if st.button("📜 Load Saved Game"):
            # TODO: Implement save/load system
            st.info("save/load system coming soon")
            pass

    with col2:
        st.markdown("""
        ### Recent Tales
        *The latest adventures from fellow travelers...*
        """)
        # TODO: Implement recent games/high scores


if __name__ == "__main__":
    main()

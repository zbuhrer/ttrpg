import streamlit as st
import uuid
import time
from pathlib import Path
from config import OLLAMA_ENDPOINT, THEME
from services.ai_service import AIService
from services.game_state import GameStateManager


st.set_page_config(
    page_title="Active Quest",
    page_icon="🗺️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Ensure knowledge base directory exists
knowledge_base_path = Path("data/knowledge_base")
knowledge_base_path.mkdir(parents=True, exist_ok=True)

if 'ai_service' not in st.session_state:
    st.session_state.ai_service = AIService(
        endpoint=OLLAMA_ENDPOINT,
        knowledge_base_path=knowledge_base_path
    )

if 'game_state_manager' not in st.session_state:
    st.session_state.game_state_manager = GameStateManager()


def setup_ui_theme():
    """Configure custom UI theme and styling"""
    st.markdown(THEME, unsafe_allow_html=True)


setup_ui_theme()

# Top Section
st.title("🗺️ Active Quest")
st.markdown("""
    <div class='story-window'>
        <h3>The Chronicles of Adventure</h3>
        <p style='font-style: italic;'>Where every choice shapes your destiny...</p>
    </div>
""", unsafe_allow_html=True)

# Check if there's an active character
if 'character' not in st.session_state:
    st.warning(
        "⚠️ No active character found! Begin your journey by creating a character first.")
    if st.button("✨ Start Your Journey", key="create_char"):
        st.switch_page("pages/01_Character_Creation.py")

else:
    # Add character ID check
    char = st.session_state['character']
    if 'id' not in char:
        char['id'] = str(uuid.uuid4())
        st.session_state['character'] = char

    # Quest Interface
    col_story, col_status, col_map = st.columns([3, 2, 1])
    with col_story:
        st.markdown("<div class='story-window'>", unsafe_allow_html=True)
        st.header("📜 Current Scene")

        # AI-Generated Narrative
        if 'current_scene' not in st.session_state:
            loading_container = st.empty()
            progress_bar = st.progress(0)

            steps = [
                ("Loading saved game state...", 0.2),
                ("Generating world...", 0.4),
                ("Creating scene...", 0.7),
                ("Finalizing details...", 0.9)
            ]

            for message, progress in steps:
                loading_container.text(message)
                progress_bar.progress(progress)
                time.sleep(0.5)

            saved_state = st.session_state.game_state_manager.load_game_state(
                st.session_state.character['id']
            )

            if saved_state:
                loading_container.text("Loading saved game...")
                progress_bar.progress(1.0)
                st.session_state.current_scene = saved_state['scene']
            else:
                loading_container.text("Generating new scene...")
                progress_bar.progress(0.8)
                st.session_state.current_scene = st.session_state.game_state_manager.generate_scene_description(
                    st.session_state.character,
                    "the Mistwood Tavern",
                    st.session_state.ai_service
                )
                st.session_state.game_state_manager.save_game_state(
                    st.session_state.character['id'],
                    st.session_state.current_scene
                )

            loading_container.empty()
            progress_bar.empty()

        st.markdown(f"*{st.session_state.current_scene}*")

        # Enhanced Action Interface
        st.subheader("🎭 Your Next Move")

        # Quick Action Buttons
        quick_actions = st.columns(4)
        with quick_actions[0]:
            if st.button("🗣️ Talk", key="talk"):
                new_scene = st.session_state.game_state_manager.generate_action_response(
                    st.session_state.character,
                    "talk to nearest person",
                    st.session_state.ai_service
                )
                st.session_state.current_scene = new_scene
                st.session_state.game_state_manager.save_game_state(
                    st.session_state.character['id'],
                    new_scene
                )

        with quick_actions[1]:
            if st.button("👀 Look", key="look"):
                new_scene = st.session_state.game_state_manager.generate_action_response(
                    st.session_state.character,
                    "examine surroundings",
                    st.session_state.ai_service
                )
                st.session_state.current_scene = new_scene
                st.session_state.game_state_manager.save_game_state(
                    st.session_state.character['id'],
                    new_scene
                )

        with quick_actions[2]:
            if st.button("🔍 Search", key="search"):
                new_scene = st.session_state.game_state_manager.generate_action_response(
                    st.session_state.character,
                    "search the area",
                    st.session_state.ai_service
                )
                st.session_state.current_scene = new_scene
                st.session_state.game_state_manager.save_game_state(
                    st.session_state.character['id'],
                    new_scene
                )

        with quick_actions[3]:
            if st.button("📖 Journal", key="journal"):
                new_scene = st.session_state.game_state_manager.generate_action_response(
                    st.session_state.character,
                    "check quest journal",
                    st.session_state.ai_service
                )
                st.session_state.current_scene = new_scene
                st.session_state.game_state_manager.save_game_state(
                    st.session_state.character['id'],
                    new_scene
                )

        # Custom Action Input
        action = st.text_input(
            "🎯 Custom Action", placeholder="What would you like to do?")
        if st.button("✨ Take Action", key="action"):
            new_scene = st.session_state.game_state_manager.generate_action_response(
                st.session_state.character,
                action,
                st.session_state.ai_service
            )
            st.session_state.current_scene = new_scene
            st.session_state.game_state_manager.save_game_state(
                st.session_state.character['id'],
                new_scene
            )
        st.markdown("</div>", unsafe_allow_html=True)

    with col_status:
        st.markdown("<div class='status-panel'>", unsafe_allow_html=True)
        char = st.session_state['character']

        # Enhanced Character Status Display
        st.header("📊 Character Status")
        st.markdown(f"""
        ### {char['name']}
        #### {char['race']} {char['class_type']}
        *{char['background']}*

        ---

        ### ⚔️ Combat Stats
        """)

        # Visual Stats Bars
        for stat, value in char['stats'].items():
            st.progress(value/100, f"{stat.title()}: {value}")

        # Quick Inventory
        st.markdown("### Quick Inventory")
        st.markdown("""
        - Steel Sword
        - Wooden Shield
        - Health Potion (2)
        """)
        st.markdown("</div>", unsafe_allow_html=True)

    with col_map:
        st.markdown("<div class='status-panel'>", unsafe_allow_html=True)
        st.header("🗺️ Location")
        # Mini-map or location description
        st.markdown('minimap placeholder')

        # Weather and Time
        st.markdown("""
        ### 🌤️ Conditions
        - Time: Dusk
        - Weather: Clear
        - Region: Mistwood
        """)
        st.markdown("</div>", unsafe_allow_html=True)

import streamlit as st

from datetime import datetime
from pathlib import Path
from config import OLLAMA_ENDPOINT, THEME
from services.ai_service import AIService, GameState, Character


st.set_page_config(
    page_title="Active Quest",
    page_icon="🗺️",
    layout="wide"
)

if 'ai_service' not in st.session_state:
    st.session_state.ai_service = AIService(
        endpoint=OLLAMA_ENDPOINT,
        knowledge_base_path=Path("data/knowledge_base")
    )


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

if 'ai_service' not in st.session_state:
    st.session_state.ai_service = AIService(OLLAMA_ENDPOINT)

# Check if there's an active character
if 'character' not in st.session_state:
    st.warning(
        "⚠️ No active character found! Begin your journey by creating a character first.")
    if st.button("✨ Start Your Journey", key="create_char"):
        st.switch_page("pages/01_Character_Creation.py")

else:
    # Quest Interface
    col_story, col_status, col_map = st.columns([3, 2, 1])
    with col_story:
        st.markdown("<div class='story-window'>", unsafe_allow_html=True)
        st.header("📜 Current Scene")

        # Narrative Display with Styling
        st.markdown("""
        *The air shimmer with arcane energy as you stand in the torch-lit tavern.
        Whispered tales of adventure float between weathered wooden beams, while
        mysterious figures huddle over ancient maps...*
        """)

        # Enhanced Action Interface
        st.subheader("🎭 Your Next Move")

        # Quick Action Buttons
        quick_actions = st.columns(4)
        with quick_actions[0]:
            if st.button("🗣️ Talk", key="talk"):
                action = "talk to nearest person"
        with quick_actions[1]:
            if st.button("👀 Look", key="look"):
                action = "examine surroundings"
        with quick_actions[2]:
            if st.button("🔍 Search", key="search"):
                action = "search the area"
        with quick_actions[3]:
            if st.button("📖 Journal", key="journal"):
                action = "check quest journal"

        # Custom Action Input
        action = st.text_input(
            "🎯 Custom Action", placeholder="What would you like to do?")
        if st.button("✨ Take Action", key="action"):
            # [Your existing action processing code here]
            pass
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
        st.markdown("### 🎒 Quick Inventory")
        st.markdown("""
        - 🗡️ Steel Sword
        - 🛡️ Wooden Shield
        - 🧪 Health Potion (2)
        """)
        st.markdown("</div>", unsafe_allow_html=True)

    with col_map:
        st.markdown("<div class='status-panel'>", unsafe_allow_html=True)
        st.header("🗺️ Location")
        # Mini-map or location description
        st.image('data/assets/minimap.png',
                 caption='Current Location', use_column_width=True)

        # Weather and Time
        st.markdown("""
        ### 🌤️ Conditions
        - Time: Dusk
        - Weather: Clear
        - Region: Mistwood
        """)
        st.markdown("</div>", unsafe_allow_html=True)

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

st.title("🗺️ Active Quest")

if 'ai_service' not in st.session_state:
    st.session_state.ai_service = AIService(OLLAMA_ENDPOINT)

# Check if there's an active character
if 'character' not in st.session_state:
    st.warning("No active character found! Please create a character first.")
    if st.button("Go to Character Creation"):
        st.switch_page("pages/01_Character_Creation.py")
else:
    # Quest Interface
    col1, col2 = st.columns([2, 1])

    with col1:
        st.header("Current Scene")
        st.markdown("---")

        # Narrative Display
        st.markdown("""
        *The torch-lit tavern buzzes with whispered tales and clinking tankards...*
        """)

        # Action Interface
        st.subheader("What would you like to do?")
        action = st.text_input("Enter your action")
        if st.button("Take Action"):
            game_state = GameState(
                location=st.session_state.get('current_location', 'Unknown'),
                time=datetime.now(),
                weather=st.session_state.get('weather', 'Clear'),
                environmental_effects=st.session_state.get('effects', []),
                active_quests=st.session_state.get('active_quests', []),
                recent_events=st.session_state.get('recent_events', [])
            )

            # Convert session character to Character object
            char_data = st.session_state.character
            character = Character(
                name=char_data['name'],
                status={"health": 100, "mana": 100},  # Default for now
                current_actions=[action],
                recent_events=st.session_state.get('action_history', []),
                stats=char_data['stats'],
                inventory=[]  # TODO: Add inventory system
            )

            # Generate response
            response = st.session_state.ai_service.generate_response(
                prompt=action,
                game_state=game_state,
                character=character
            )

            if response.success:
                # Update game state
                if 'action_history' not in st.session_state:
                    st.session_state.action_history = []
                st.session_state.action_history.append(action)
                st.session_state.current_scene = response.content

                # Display the response
                st.markdown(response.content)
            else:
                st.error(f"Failed to process action: {response.error}")
                st.error("Please try again or take a different action.")
            pass

    with col2:
        # Character Status
        st.header("Character Status")
        if 'character' in st.session_state:
            char = st.session_state['character']
            st.markdown(f"""
            **{char['name']}**
            *{char['race']} {char['class_type']}*
            Background: {char['background']}
            """)

            # Stats Display
            st.subheader("Stats")
            for stat, value in char['stats'].items():
                st.markdown(f"**{stat.title()}:** {value}")

        # Quest Log
        st.header("Quest Log")
        st.markdown("""
        - [ ] Investigate the mysterious disappearances
        - [ ] Find the ancient artifact
        - [ ] Defeat the dark sorcerer
        """)

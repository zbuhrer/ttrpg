import streamlit as st

st.set_page_config(
    page_title="Active Quest - Echoes of Elysium",
    page_icon="🗺️",
    layout="wide"
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


setup_ui_theme()

st.title("🗺️ Active Quest")

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
            # TODO: Process action through game engine
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

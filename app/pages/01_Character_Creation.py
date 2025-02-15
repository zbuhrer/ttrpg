import streamlit as st

st.set_page_config(
    page_title="Character Creation - Echoes of Elysium",
    page_icon="🎭",
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

st.title("🎭 Character Creation")
st.header("Forge Your Legend")

# Character Creation Form
with st.form("character_creation_form"):
    name = st.text_input("Character Name")

    col1, col2 = st.columns(2)

    with col1:
        race = st.selectbox("Race", [
            "Human",
            "Elf",
            "Dwarf",
            "Halfling",
            "Orc",
            "Gnome"
        ])

        class_type = st.selectbox("Class", [
            "Warrior",
            "Mage",
            "Rogue",
            "Cleric",
            "Ranger",
            "Paladin"
        ])

    with col2:
        background = st.selectbox("Background", [
            "Noble",
            "Soldier",
            "Scholar",
            "Criminal",
            "Merchant",
            "Artisan"
        ])

    st.subheader("Base Stats")
    col3, col4, col5 = st.columns(3)

    with col3:
        strength = st.slider("Strength", 8, 18, 10)
        dexterity = st.slider("Dexterity", 8, 18, 10)

    with col4:
        constitution = st.slider("Constitution", 8, 18, 10)
        intelligence = st.slider("Intelligence", 8, 18, 10)

    with col5:
        wisdom = st.slider("Wisdom", 8, 18, 10)
        charisma = st.slider("Charisma", 8, 18, 10)

    submit_button = st.form_submit_button("Create Character")

    if submit_button:
        # Create character and store in session state
        character = {
            "name": name,
            "race": race,
            "class_type": class_type,
            "background": background,
            "stats": {
                "strength": strength,
                "dexterity": dexterity,
                "constitution": constitution,
                "intelligence": intelligence,
                "wisdom": wisdom,
                "charisma": charisma
            }
        }
        st.session_state['character'] = character
        st.success(f"Character {name} created successfully!")

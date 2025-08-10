import streamlit as st
from config import THEME


"""
This file is flagged for deletion; we are handling character creation directly in the active quest page of the app"""

st.set_page_config(
    page_title="Character Creation - Aetherquill",
    page_icon="🎭",
    layout="wide",
    initial_sidebar_state="collapsed"
)


def setup_ui_theme():
    """Configure custom UI theme and styling"""
    st.markdown(THEME, unsafe_allow_html=True)


def initialize_character_data():
    """Initialize empty character data structure"""
    if 'character' not in st.session_state:
        st.session_state.character = {
            'personality': {
                'traits': [],
                'ideals': '',
                'bonds': '',
                'flaws': ''
            },
            'background_details': {
                'origin': '',
                'profession': '',
                'life_event': '',
                'motivation': ''
            }
        }


def render_character_personality():
    """Render personality and background customization fields"""
    st.subheader("🎭 Character Personality")

    personality = {
        "traits": st.multiselect(
            "Key Personality Traits",
            ["Brave", "Cautious", "Curious", "Determined", "Friendly", "Mysterious",
             "Optimistic", "Pragmatic", "Rebellious", "Scholarly", "Stoic", "Witty"]
        ),
        "ideals": st.text_area(
            "Character Ideals",
            placeholder="What principles does your character live by?"
        ),
        "bonds": st.text_area(
            "Character Bonds",
            placeholder="What connects your character to the world?"
        ),
        "flaws": st.text_area(
            "Character Flaws",
            placeholder="What weaknesses shape your character?"
        )
    }

    st.subheader("📜 Background Details")

    background_details = {
        "origin": st.text_input(
            "Homeland/Origin",
            placeholder="Where does your character come from?"
        ),
        "profession": st.text_input(
            "Previous Profession",
            placeholder="What did they do before adventuring?"
        ),
        "life_event": st.text_area(
            "Significant Life Event",
            placeholder="What event changed their life's direction?"
        ),
        "motivation": st.text_area(
            "Adventure Motivation",
            placeholder="Why did they choose the adventuring life?"
        )
    }

    return personality, background_details


setup_ui_theme()
initialize_character_data()

st.title("🎭 Character Creation")
st.header("Forge Your Legend")

# Character Creation Form
with st.form("character_creation_form"):
    tab1, tab2, tab3 = st.tabs(["Basic Info", "Personality", "Background"])

    with tab1:
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

    with tab2:
        personality, background_details = render_character_personality()

    with tab3:
        st.subheader("🎨 Appearance")
        appearance = {
            "height": st.text_input("Height"),
            "build": st.select_slider(
                "Build",
                options=["Slight", "Average", "Athletic", "Muscular", "Heavy"]
            ),
            "distinctive_features": st.text_area(
                "Distinctive Features",
                placeholder="Scars, tattoos, or unique characteristics?"
            )
        }

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
            },
            "personality": personality,
            "background_details": background_details,
            "appearance": appearance
        }
        st.session_state['character'] = character
        st.success(f"Character {name} created successfully!")

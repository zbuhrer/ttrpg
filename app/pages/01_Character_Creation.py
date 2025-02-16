import streamlit as st
from config import THEME

st.set_page_config(
    page_title="Character Creation - Aetherquill",
    page_icon="🎭",
    layout="wide"
)


def setup_ui_theme():
    """Configure custom UI theme and styling"""
    st.markdown(THEME, unsafe_allow_html=True)


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

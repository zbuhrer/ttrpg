import streamlit as st
from config import THEME

st.set_page_config(
    page_title="Settings - Aetherquill",
    page_icon="⚙️",
    layout="wide"
)


def setup_ui_theme():
    """Configure custom UI theme and styling"""
    st.markdown(THEME, unsafe_allow_html=True)


setup_ui_theme()

st.title("⚙️ Game Settings")

# Settings Interface
col1, col2 = st.columns(2)

with col1:
    st.header("Game Options")

    # Difficulty Setting
    difficulty = st.select_slider(
        "Game Difficulty",
        options=["Easy", "Normal", "Hard", "Legendary"]
    )

    # Text Speed
    text_speed = st.slider(
        "Text Display Speed",
        min_value=1,
        max_value=10,
        value=5
    )

    # Auto-save
    auto_save = st.toggle("Enable Auto-save")

with col2:
    st.header("Audio Settings")

    # Volume Controls
    master_volume = st.slider("Master Volume", 0, 100, 80)
    music_volume = st.slider("Music Volume", 0, 100, 70)
    effects_volume = st.slider("Sound Effects", 0, 100, 75)

    # Theme Selection
    theme = st.selectbox(
        "Music Theme",
        ["Epic Fantasy", "Mysterious", "Peaceful", "Dark", "Custom"]
    )

# Save Settings
if st.button("Save Settings"):
    # TODO: Implement settings save functionality
    settings = {
        "difficulty": difficulty,
        "text_speed": text_speed,
        "auto_save": auto_save,
        "master_volume": master_volume,
        "music_volume": music_volume,
        "effects_volume": effects_volume,
        "theme": theme
    }
    st.session_state['settings'] = settings
    st.success("Settings saved successfully!")

# Reset to Defaults
if st.button("Reset to Defaults"):
    # TODO: Implement reset functionality
    st.warning("This will reset all settings to their default values.")

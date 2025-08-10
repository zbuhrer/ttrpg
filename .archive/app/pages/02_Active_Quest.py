import streamlit as st
import uuid
import time
from pathlib import Path
from config import OLLAMA_ENDPOINT, THEME  # Assuming THEME is in config.py
from services.ai_service import AIService, combat_actions
from services.game_state import GameStateManager, GameStateConfig
from services.character_service import CharacterService
import logging

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)  # Or logging.DEBUG for more detail

# --- Ensure Knowledge Base Exists and is Populated (CRUCIAL) ---
knowledge_base_path = Path("data/knowledge_base")
knowledge_base_path.mkdir(parents=True, exist_ok=True)
# Add code here to create default knowledge base files if they don't exist
# Example:
if not (knowledge_base_path / "example_lore.txt").exists():
    with open(knowledge_base_path / "example_lore.txt", "w") as f:
        f.write(
            "The Mistwood Tavern is a cozy place.  It is known for its strong ale and warm fire.")
    logger.info("Created default knowledge base file: example_lore.txt")
else:
    logger.info("Knowledge base directory already exists and/or contains files.")


# --- Cached Service Initialization ---
@st.cache_resource
def get_ai_service(knowledge_base_path: Path):
    logger.info("Creating new AI Service instance.")
    return AIService(
        endpoint=OLLAMA_ENDPOINT,
        knowledge_base_path=knowledge_base_path
    )


@st.cache_resource
def get_game_state_manager(config: GameStateConfig):
    logger.info("Creating new Game State Manager instance.")
    return GameStateManager(config=config)


# --- Session State Initialization (MUST BE AT TOP) ---
if "character" not in st.session_state:
    st.session_state.character = None
if 'ai_service' not in st.session_state:
    st.session_state.ai_service = get_ai_service(knowledge_base_path)
    logger.info("Initialized ai_service in session state.")
else:
    logger.info("ai_service already exists in session state.")

if 'game_state_manager' not in st.session_state:
    st.session_state.game_state_manager = get_game_state_manager(
        GameStateConfig())
    logger.info("Initialized game_state_manager in session state.")
else:
    logger.info("game_state_manager already exists in session state.")

if 'active_quest_text_current_scene' not in st.session_state:
    st.session_state.active_quest_text_current_scene = "The mists of adventure swirl around you..."
    logger.info("Initialized active_quest_text_current_scene in session state.")
if 'game_data' not in st.session_state:
    st.session_state.game_data = {}
    logger.info("Initialized game_data in session state.")
# Point-buy system variables
if 'stat_points' not in st.session_state:
    st.session_state.stat_points = 27
    logger.info("Initialized stat_points in session state.")
if 'base_stats' not in st.session_state:
    st.session_state.base_stats = {
        'strength': 8,
        'dexterity': 8,
        'constitution': 8,
        'intelligence': 8,
        'wisdom': 8,
        'charisma': 8
    }
    logger.info("Initialized base_stats in session state.")
if 'character_created' not in st.session_state:
    st.session_state.character_created = False  # Flag to disable the form
    logger.info("Initialized character_created in session state.")
if 'background_story' not in st.session_state:
    st.session_state.background_story = None  # To hold the AI generated story
    logger.info("Initialized background_story in session state.")
if 'generating_action' not in st.session_state:
    st.session_state.generating_action = False
    logger.info("Initialized generating_action in session state.")

# --- XP Reward Values ---
XP_REWARDS = {
    "talk": 10,
    "look": 5,
    "search": 15,
    "journal": 8,
    "action": 20  # Base XP for custom actions
}

# --- Service Initialization ---
character_service = CharacterService()
logger.info("Character service initialized.")

# --- UI Theme Setup ---


def setup_ui_theme():
    """Configures custom UI theme and styling (from config.py)."""
    st.markdown(THEME, unsafe_allow_html=True)


logger.info("Theme configured.")


def create_character():
    """Character creation interface with point-buy system."""
    st.subheader("✨ Create Your Character")

    with st.form("character_creation", clear_on_submit=False):
        # Basic Information
        name = st.text_input(
            "Character Name", disabled=st.session_state.character_created)
        race = st.selectbox("Race", character_service.get_races(
        ), disabled=st.session_state.character_created)
        class_type = st.selectbox("Class", character_service.get_classes(
        ), disabled=st.session_state.character_created)
        background = st.selectbox("Background", character_service.get_backgrounds(
        ), disabled=st.session_state.character_created)

        # Attribute adjustments
        attributes = ['strength', 'dexterity', 'constitution',
                      'intelligence', 'wisdom', 'charisma']
        stat_cols = st.columns(3)  # Create 3 columns for stats
        attribute_abbreviations = {
            'strength': 'STR',
            'dexterity': 'DEX',
            'constitution': 'CON',
            'intelligence': 'INT',
            'wisdom': 'WIS',
            'charisma': 'CHA'
        }

        # Create a dictionary to store the input values
        stat_inputs = {}

        for i, stat in enumerate(attributes):
            with stat_cols[i % 3]:
                stat_inputs[stat] = st.number_input(
                    label=f"{attribute_abbreviations[stat]}:",
                    min_value=8,
                    max_value=18,
                    value=st.session_state.base_stats[stat],
                    step=1,
                    disabled=st.session_state.character_created,
                    key=f"stat_input_{stat}"
                )

        # Skill selection
        all_skills = character_service.get_skills()
        available_skills = []
        for stat, skills in all_skills.items():
            available_skills.extend(skills)

        selected_skills = st.multiselect(
            "Choose your skills (Max 3)",
            options=available_skills,
            max_selections=3,
            disabled=st.session_state.character_created
        )

        # Calculate points remaining
        total_stat_points_spent = sum(
            [stat_inputs[stat] - 8 for stat in attributes])  # Use stat_inputs
        points_remaining = st.session_state.stat_points - total_stat_points_spent

        # Display remaining points
        st.write(f"Points Remaining: {points_remaining}")

        # Submit button
        submitted = st.form_submit_button(
            "Create Character", disabled=st.session_state.character_created)
        if submitted:
            # Update session state with the stat_inputs values
            for stat in attributes:
                st.session_state.base_stats[stat] = stat_inputs[stat]

            # Validate input and calculate remaining points
            total_stat_points = sum(st.session_state.base_stats.values())
            # total - the result, since every stat started at 8
            remaining_points = 27 - (total_stat_points - (8*6))

            if remaining_points != 0:
                st.error(f"You must spend exactly 27 points. You have {
                    remaining_points} unspent.")
            elif not (name and race and class_type and background):
                st.error("Please fill in all required fields!")
            else:
                # Store character data in session state
                character_data = {
                    'id': str(uuid.uuid4()),  # Assign a UUID
                    'name': name,
                    'race': race,
                    'class_type': class_type,
                    'background': background,
                    'attributes': st.session_state.base_stats.copy(),
                    'skills': selected_skills.copy()  # Ensure a copy is stored
                }
                # Finalize character creation
                st.session_state.character = character_service.finalize_character(
                    character_data)

                # Set the character creation flag
                st.session_state.character_created = True  # Disable the form

                # Initialize game state (Moved here)
                with st.spinner("Loading initial scene..."):
                    initial_state = st.session_state.game_state_manager.create_new_game(
                        st.session_state.character,
                        st.session_state.ai_service
                    )

                    # Set initial scene and game data
                    st.session_state.active_quest_text_current_scene = initial_state['scene']
                    st.session_state.game_data = initial_state['game_data']

                st.rerun()


logger.info("Create character defined.")


def load_environmental_details():
    """Loads weather and environmental conditions for display."""
    if 'game_data' in st.session_state:
        with st.spinner("Observing the environment..."):
            time.sleep(1)  # Add slight delay for effect
            return st.session_state.game_data.get('weather', ''), \
                st.session_state.game_data.get('environmental_effects', [])
    return '', []


logger.info("load_environmental_details defined.")


def load_inventory():
    """Loads character inventory for display."""
    if 'game_data' in st.session_state:
        # Access character data
        # Access character data safely
        character_data = st.session_state.game_data.get('character_data', {})
        with st.spinner("Checking your belongings..."):
            time.sleep(0.5)  # Add slight delay for effect
            return character_data.get('inventory', [])
    return []


logger.info("load_inventory defined.")

# --- UI Setup ---
setup_ui_theme()

# --- Top Section ---
st.title("Active Quest")
st.markdown("""
    <div class='story-window'>
        <h3>The Chronicles of Adventure</h3>
    </div>
""", unsafe_allow_html=True)

# --- Character Creation and Quest Interface Logic ---
if st.session_state.character is None:
    # --- Character Creation ---
    create_character()
else:
    # --- Character Sheet and Edit Button ---
    st.subheader("⚔️ Your Character")
    # Load character data from game_data
    char = st.session_state.character

    st.markdown(f"""
**Name:** {char['name']}<br>
**Race:** {char['race']}<br>
**Class:** {char['class_type']}<br>
**Background:** {char['background']}
""", unsafe_allow_html=True)

    st.write("Stats:")
    for stat, value in char['stats'].items():
        modifier = char['attribute_modifiers'][stat]  # Show the modifier
        # Include modifier
        st.write(f"- {stat}: {value} (Modifier: {modifier:+})")

    st.write("Skills:")
    for skill in char['skills']:
        st.write(f"- {skill}")

    # Display Level and XP
    st.write(f"Level: {char['level']}")
    st.write(f"Experience: {char['experience']
                            } / {char['experience_threshold']}")

    if st.session_state.background_story:
        st.markdown("### 📜 Background Story")
        st.markdown(f"*{st.session_state.background_story}*")

    # Warning about editing mid-game
    st.warning(
        "⚠️ Changing character details mid-adventure may disrupt the story. Use with caution!")

    if st.button("✏️ Edit Character"):
        st.session_state.character_created = False
        st.session_state.background_story = None  # Clear the old background story
        st.rerun()

    # --- Active Quest Interface ---
    col_story, col_status, col_map = st.columns([3, 2, 1])

    with col_story:
        st.markdown("<div class='story-window'>", unsafe_allow_html=True)
        st.header("📜 Current Scene")
        # Renamed
        st.markdown(f"*{st.session_state.active_quest_text_current_scene}*")

        # --- Enhanced Action Interface ---
        st.subheader("🎭 Your Next Move")

        # Quick Action Buttons
        quick_actions = st.columns(4)

        def handle_action(action_key):
            """Handles the action and updates the game state."""
            if not st.session_state.generating_action:
                st.session_state.generating_action = True
                try:
                    with st.spinner("Generating action response..."):
                        ai_response = st.session_state.game_state_manager.generate_action_response(
                            st.session_state.character,
                            action_key,  # Use the action key as the action
                            st.session_state.ai_service
                        )

                        # Get the XP value
                        xp_reward = XP_REWARDS.get(
                            action_key, 0) + ai_response.xp
                        # Update the character
                        st.session_state.character = character_service.add_experience(
                            st.session_state.character,
                            xp_reward
                        )
                        # Save the scene
                        st.session_state.active_quest_text_current_scene = ai_response.content  # Renamed

                        # Save the game!
                        st.session_state.game_state_manager.save_game_state(
                            st.session_state.character['id'],
                            st.session_state.active_quest_text_current_scene,
                            game_data=st.session_state.game_data,
                            character_data=st.session_state.character
                        )
                finally:
                    st.session_state.generating_action = False
                    st.rerun()

        with quick_actions[0]:
            if st.button("🗣️ Converse", key="talk", disabled=st.session_state.generating_action):  # Improved Label
                handle_action("talk")

        with quick_actions[1]:
            if st.button("👀 Observe", key="look", disabled=st.session_state.generating_action):  # Improved Label
                handle_action("look")

        with quick_actions[2]:
            if st.button("🔍 Scrutinize", key="search", disabled=st.session_state.generating_action):  # Improved Label
                handle_action("search")

        with quick_actions[3]:
            if st.button("📖 Ponder", key="journal", disabled=st.session_state.generating_action):  # Improved Label
                handle_action("journal")

        # Custom Action Input
        action = st.text_input(
            "🔮 What fate will you weave?", placeholder="Unleash your ingenuity...", disabled=st.session_state.generating_action)  # Improved Tone
        if st.button("✨ Invoke Action", key="action", disabled=st.session_state.generating_action):  # Improved Label
            if not st.session_state.generating_action:
                st.session_state.generating_action = True
                try:
                    with st.spinner("Generating action response..."):
                        ai_response = st.session_state.game_state_manager.generate_action_response(
                            st.session_state.character,
                            action,
                            st.session_state.ai_service
                        )

                        # Get the XP value
                        xp_reward = XP_REWARDS.get(
                            "action", 0) + ai_response.xp
                        # Update the character
                        st.session_state.character = character_service.add_experience(
                            st.session_state.character,
                            xp_reward
                        )
                        # Save the scene
                        st.session_state.active_quest_text_current_scene = ai_response.content  # Renamed

                        # Save the game!
                        st.session_state.game_state_manager.save_game_state(
                            st.session_state.character['id'],
                            st.session_state.active_quest_text_current_scene,
                            game_data=st.session_state.game_data,
                            character_data=st.session_state.character
                        )
                finally:
                    st.session_state.generating_action = False
                    st.rerun()

        # Display Available Actions (Debug/Insight)
        st.subheader("Available Actions")
        for ca in combat_actions:
            st.write(f"- **{ca.name}**: {ca.description}")
        st.markdown("</div>", unsafe_allow_html=True)

    with col_status:
        st.markdown("<div class='status-panel'>",
                    unsafe_allow_html=True)
        if st.session_state.character is not None:
            char = st.session_state.character

            # Define weather and effects placeholders
            weather = "Clear skies"
            effects = ["Gentle breeze"]

            # Load details progressively
            # weather, effects = load_environmental_details() # Commented out, using placeholders for now
            inventory = load_inventory()

            # Enhanced Character Status Display
            st.header("📊 Character Status")
            st.markdown(f"""
        ### {char['name']}
        #### {char['race']} {char['class_type']}
        *{char['background']}*
        """)

            # Visual Stats Bars
            if 'stats' in char:
                for stat, value in char['stats'].items():
                    # Get the modifier
                    modifier = char['attribute_modifiers'][stat]
                    # Ensure progress value is within [0, 1]
                    progress_value = min(value / 18, 1.0)  # Clamp the value
                    st.progress(
                        # Show the modifier
                        progress_value, f"{stat.title()}: {value} (Modifier: {modifier:+})")

            # Quick Inventory
            st.markdown("### 📦 Inventory")
            for item in inventory:
                st.write(
                    f"- {item['item']} (x{item['quantity']})")

            # Display Combat State
            if 'combat_state' in st.session_state.game_data and st.session_state.game_data['combat_state']['active']:
                st.header("⚔️ Combat State")
                combat_state = st.session_state.game_data['combat_state']
                st.write(f"Round: {combat_state['round']}")
                st.write("Combatants:")
                for combatant in combat_state['combatants']:
                    st.write(
                        f"- {combatant['name']} (Initiative: {combatant['initiative']})")

        st.markdown("</div>", unsafe_allow_html=True)

    with col_map:
        st.markdown(
            "<div class='status-panel'>", unsafe_allow_html=True)
        st.header("🗺️ Location")
        # Mini-map or location description
        st.markdown('minimap placeholder')

        # Weather and Time
        st.markdown("### 🌤️ Conditions")
        st.write(weather)
        for effect in effects:
            st.write(f"- {effect}")
        st.markdown(
            "</div>", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

logger.info("02_Active_Quest.py script finished.")

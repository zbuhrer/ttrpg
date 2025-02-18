import streamlit as st
import uuid
import time
from pathlib import Path
from config import OLLAMA_ENDPOINT, THEME
from services.ai_service import AIService
from services.game_state import GameStateManager
from services.character_service import CharacterService


st.set_page_config(
    page_title="Active Quest",
    page_icon="🗺️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Initialize services
character_service = CharacterService()

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

if 'show_character_creation' not in st.session_state:
    st.session_state.show_character_creation = False

if 'creation_step' not in st.session_state:
    st.session_state.creation_step = 1


def setup_ui_theme():
    """Configure custom UI theme and styling"""
    st.markdown(THEME, unsafe_allow_html=True)


def create_character():
    """Enhanced character creation interface"""
    st.subheader("✨ Create Your Character")

    # Step indicators
    steps = ['Basic Info', 'Attributes',
             'Background', 'Customization', 'Review']
    st.progress((st.session_state.creation_step - 1) / len(steps))

    if st.session_state.creation_step == 1:
        with st.form("basic_info"):
            name = st.text_input("Character Name")
            race = st.selectbox("Race", character_service.get_races())

            # Show race details
            if race:
                race_details = character_service.get_race_details(race)
                with st.expander(f"About {race}"):
                    st.write(race_details['description'])
                    st.write("**Racial Abilities:**")
                    for ability in race_details['abilities']:
                        st.write(f"- {ability}")

            class_type = st.selectbox("Class", character_service.get_classes())

            # Show class details
            if class_type:
                class_details = character_service.get_class_details(class_type)
                with st.expander(f"About {class_type}"):
                    st.write(f"**Hit Dice:** {class_details['hit_dice']}")
                    st.write("**Special Abilities:**")
                    for ability, desc in class_details['special_abilities'].items():
                        st.write(f"- {ability}: {desc}")

            if st.form_submit_button("Next"):
                if name and race and class_type:
                    st.session_state.temp_character = {
                        'name': name,
                        'race': race,
                        'class_type': class_type
                    }
                    st.session_state.creation_step = 2
                    st.rerun()
                else:
                    st.error("Please fill in all required fields!")

    elif st.session_state.creation_step == 2:
        with st.form("attributes"):
            st.write("### Attribute Points")
            st.write("Distribute your attribute points wisely!")

            remaining_points = 27
            attributes = {}

            col1, col2 = st.columns(2)

            with col1:
                for attr in ['strength', 'dexterity', 'constitution']:
                    attributes[attr] = st.slider(
                        attr.capitalize(),
                        min_value=8,
                        max_value=15,
                        value=10,
                        help=character_service._base_attributes[attr]['description']
                    )

            with col2:
                for attr in ['intelligence', 'wisdom', 'charisma']:
                    attributes[attr] = st.slider(
                        attr.capitalize(),
                        min_value=8,
                        max_value=15,
                        value=10,
                        help=character_service._base_attributes[attr]['description']
                    )

            if st.form_submit_button("Next"):
                st.session_state.temp_character['attributes'] = attributes
                st.session_state.creation_step = 3
                st.rerun()

    elif st.session_state.creation_step == 3:
        with st.form("background"):
            background = st.selectbox(
                "Background", character_service.get_backgrounds())

            # Generate AI-assisted background story
            if background:
                temp_data = st.session_state.temp_character.copy()
                temp_data['background'] = background

                if st.form_submit_button("Generate Background Story"):
                    story = character_service.generate_background_story(
                        temp_data)
                    st.session_state.temp_character['background'] = background
                    st.session_state.temp_character['background_story'] = story
                    st.markdown(f"*{story}*")

            if st.form_submit_button("Next"):
                st.session_state.creation_step = 4
                st.rerun()

    elif st.session_state.creation_step == 4:
        # Final customization and review
        st.write("### Review Your Character")

        col1, col2 = st.columns(2)

        with col1:
            st.write("#### Basic Information")
            st.write(f"**Name:** {st.session_state.temp_character['name']}")
            st.write(f"**Race:** {st.session_state.temp_character['race']}")
            st.write(
                f"**Class:** {st.session_state.temp_character['class_type']}")

        with col2:
            st.write("#### Attributes")
            for attr, value in st.session_state.temp_character['attributes'].items():
                st.write(f"**{attr.capitalize()}:** {value}")

        st.write("#### Background Story")
        st.markdown(
            f"*{st.session_state.temp_character.get('background_story', '')}*")

        if st.button("Complete Character Creation"):
            # Generate final character with all calculations
            final_character = character_service.finalize_character(
                st.session_state.temp_character
            )
            st.session_state.character = final_character
            st.session_state.show_character_creation = False
            st.success(
                f"Character {final_character['name']} created successfully!")
            st.rerun()


def load_initial_scene():
    """Load the initial scene description"""
    if 'current_scene' not in st.session_state:
        loading_message = st.empty()
        progress_bar = st.progress(0)

        loading_message.text("Loading your adventure...")
        progress_bar.progress(25)

        saved_state = st.session_state.game_state_manager.load_game_state(
            st.session_state.character['id']
        )
        progress_bar.progress(50)

        if saved_state:
            st.session_state.current_scene = saved_state['scene']
            st.session_state.game_data = saved_state['game_data']
            progress_bar.progress(100)
        else:
            loading_message.text("Generating new adventure...")
            progress_bar.progress(75)

            # Create new game state
            initial_state = st.session_state.game_state_manager.create_new_game(
                st.session_state.character,
                st.session_state.ai_service
            )

            st.session_state.current_scene = initial_state['scene']
            st.session_state.game_data = initial_state['game_data']
            progress_bar.progress(100)

        loading_message.empty()
        progress_bar.empty()


def load_environmental_details():
    """Load weather and environmental conditions"""
    if 'game_data' in st.session_state:
        with st.spinner("Observing the environment..."):
            time.sleep(1)  # Add slight delay for effect
            return st.session_state.game_data.get('weather', ''), \
                st.session_state.game_data.get('environmental_effects', [])
    return '', []


def load_inventory():
    """Load character inventory"""
    if 'game_data' in st.session_state:
        with st.spinner("Checking your belongings..."):
            time.sleep(0.5)  # Add slight delay for effect
            return st.session_state.game_data.get('character_state', {}).get('inventory', [])
    return []


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
    # Add character creation trigger button
    if st.button("Create Character"):
        st.session_state.show_character_creation = True

    # Show character creation if triggered
    if st.session_state.show_character_creation:
        create_character()

else:
    # Add character ID check
    char = st.session_state['character']
    if 'id' not in char:
        char['id'] = str(uuid.uuid4())
        st.session_state['character'] = char

    # Quest Interface
    col_story, col_status, col_map = st.columns([3, 2, 1])

    # Load initial scene
    load_initial_scene()

    with col_story:
        st.markdown("<div class='story-window'>", unsafe_allow_html=True)
        st.header("📜 Current Scene")
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

        # Load details progressively
        weather, effects = load_environmental_details()
        inventory = load_inventory()

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
        st.markdown("### 📦 Inventory")
        for item in inventory:
            st.write(f"- {item['item']} (x{item['quantity']})")
        st.markdown("</div>", unsafe_allow_html=True)

    with col_map:
        st.markdown("<div class='status-panel'>", unsafe_allow_html=True)
        st.header("🗺️ Location")
        # Mini-map or location description
        st.markdown('minimap placeholder')

        # Weather and Time
        st.markdown("### 🌤️ Conditions")
        st.write(weather)
        for effect in effects:
            st.write(f"- {effect}")
        st.markdown("</div>", unsafe_allow_html=True)

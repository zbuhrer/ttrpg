import streamlit as st
import sqlite3
import json
import logging

from datetime import datetime
from typing import Optional, Dict, Any, List, Protocol
from dataclasses import dataclass, field
# Assuming these are your data model classes
from .models import GameState, Character
from typing import TypedDict

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)  # Or logging.DEBUG for more detail


class AIServiceInterface(Protocol):
    """Protocol defining the expected methods of the AI service."""

    def generate_response(self, prompt: str, game_state: Optional[GameState] = None, character: Optional[Character] = None) -> str:
        ...


class GameData(TypedDict, total=False):
    """TypedDict to represent Game Data Dictionary"""
    time: str
    weather: str
    environmental_effects: List[str]
    active_quests: List[str]
    recent_events: List[str]
    character_state: Dict[str, Any]


@dataclass
class GameStateConfig:
    """Configuration for the Game State Manager."""
    db_path: str = 'game_data.db'
    default_location: str = "Mistwood Tavern"
    initial_health: int = 100
    initial_energy: int = 100
    default_weather: str = "clear"


class GameStateManager:
    """Manages the game state, including saving, loading, and generating content."""

    def __init__(self, config: Optional[GameStateConfig] = None):
        """Initializes the GameStateManager with an optional configuration."""
        self.config = config or GameStateConfig()
        self._init_database()

    def _init_database(self) -> None:
        """Initializes the SQLite database."""
        try:
            conn = sqlite3.connect(self.config.db_path)
            c = conn.cursor()

            c.execute('''
                CREATE TABLE IF NOT EXISTS game_states (
                    char_id TEXT PRIMARY KEY,
                    scene TEXT,
                    location TEXT,
                    timestamp TEXT,
                    game_data JSON
                )
            ''')

            conn.commit()
            logger.info("Database initialized successfully.")
        except sqlite3.Error as e:
            logger.error(f"Database initialization failed: {e}")
            raise
        finally:
            conn.close()

    def create_new_game(self, character: Dict[str, Any], ai_service: AIServiceInterface) -> Dict[str, Any]:
        """Creates a new game state for the given character using the AI service."""
        initial_state = self._generate_initial_game_state(
            character, ai_service)

        # Save the initial state to the database
        self.save_game_state(
            char_id=character['id'],
            scene=initial_state['scene'],
            location=initial_state['location'],
            game_data=initial_state['game_data']
        )

        return initial_state

    def _generate_initial_game_state(self, character: Dict[str, Any], ai_service: AIServiceInterface) -> Dict[str, Any]:
        """Generates the initial game state content using the AI service."""

        traits = character.get('personality', {}).get('traits', [])
        trait_description = f"with {traits[0]} tendencies" if traits else ""

        # Safely get background details
        background_details = character.get('background_details', {})
        origin = background_details.get('origin', 'unknown origins')
        profession = background_details.get('profession', 'mysterious past')
        motivation = background_details.get('motivation', 'seeking adventure')

        weather_prompt = f"""
        Describe the weather in the Mistwood Tavern, where {character['name']}'s first adventure begins.
        {character['name']} is a {character['race']} {character['class_type']} with a background as a {character['background']} from {origin}.
        {f"Their personality is described as {
            ', '.join(traits)}." if traits else "They have no defined personality traits."}

        Consider the character's background and the location when creating the description.
        Specify the season.
        Limit the description to 2 sentences.
        The weather should be atmospheric and evocative.
        """
        weather_response = self._safe_generate_response(
            ai_service, weather_prompt, "The weather is typical.")

        inventory_prompt = f"""
        As a {character['race']} {character['class_type']} named {character['name']} with a background as a {profession}, what 5 items would they realistically carry?
        Generate a bulleted list of items.
        For each item, include a one-sentence description that adds flavor and context. The quantity should always be '1' unless there is an obvious reason to have more.
        Include a unique or personalized item reflecting their background as {character['background']}.

        Example output:
        * Shortsword - A reliable weapon for close combat.
        * Waterskin - Holds a day's worth of water.
        * A worn map of the Mistwood
        """
        inventory_response = self._safe_generate_response(
            ai_service, inventory_prompt, "* Empty pack.")

        scene_prompt = f"""
        {character['name']}, a {character['race']} {character['class_type']}, arrives in the Mistwood Tavern to begin their adventure.
        They are {trait_description} and have a background as a {profession} with the motivation to {motivation}.

        Describe the tavern scene, including the following:
        *   The overall atmosphere (e.g., lively, dreary, mysterious).
        *   A few notable NPCs (brief descriptions).
        *   A potential "hook" or hint at an upcoming quest or problem.

        Keep the description concise (around 4-5 sentences) and descriptive. Imbue the description with a sense of adventure and mystery.
        """
        scene_response = self._safe_generate_response(
            ai_service, scene_prompt, "You arrive at a bustling tavern.")

        initial_game_data: GameData = {
            'time': datetime.now().isoformat(),
            'weather': weather_response,
            'environmental_effects': self._generate_environmental_effects(weather_response),
            'active_quests': ['The Call to Adventure'],
            'recent_events': ['Arrived at Mistwood Tavern'],
            'character_state': {
                'status': {
                    'health': self.config.initial_health,
                    'energy': self.config.initial_energy,
                    'rested': True
                },
                'inventory': self._parse_inventory(inventory_response)
            }
        }

        return {
            'scene': scene_response,
            'location': self.config.default_location,
            'game_data': initial_game_data
        }

    def _generate_environmental_effects(self, weather_text: str) -> List[str]:
        """Generates environmental effects based on the weather description."""
        effects = ['Tavern ambiance', 'Warm hearth']  # Default effects

        weather_lower = weather_text.lower()
        if 'rain' in weather_lower:
            effects.extend(['Wet ground', 'Poor visibility'])
        if 'wind' in weather_lower:
            effects.append('Strong breeze')
        if 'storm' in weather_lower:
            effects.extend(['Thunder', 'Lightning flashes'])
        if 'snow' in weather_lower:
            effects.extend(['Cold air', 'Slippery ground'])
        if 'fog' in weather_lower:
            effects.append('Limited visibility')
        if 'sun' in weather_lower or 'clear' in weather_lower:
            effects.append('Good visibility')

        return effects

    def _parse_inventory(self, inventory_text: str) -> List[Dict[str, Any]]:
        """Parses inventory text into a structured format."""
        inventory_items = []

        for line in inventory_text.split('\n'):
            line = line.strip()
            if line:
                line = line.lstrip('•-*1234567890. ')  # Remove bullet points

                quantity = 1  # Default quantity
                item_name = line  # Assume the whole line is the item name

                # Check if quantity is specified in parentheses
                if '(' in line and ')' in line:
                    item_parts = line.split('(')
                    item_name = item_parts[0].strip()
                    try:
                        quantity = int(
                            ''.join(filter(str.isdigit, item_parts[1])))
                    except ValueError:
                        quantity = 1

                inventory_items.append({
                    'item': item_name,
                    'quantity': quantity
                })

        if not inventory_items:
            inventory_items = [
                {'item': 'Adventurer\'s Pack', 'quantity': 1},
                {'item': 'Waterskin', 'quantity': 1},
                {'item': 'Trail Rations', 'quantity': 3}
            ]

        return inventory_items

    def save_game_state(self,
                        char_id: str,
                        scene: str,
                        location: Optional[str] = None,
                        game_data: Optional[Dict[str, Any]] = None) -> None:
        """Saves the current game state to the database."""
        location = location or self.config.default_location  # Use default if None

        try:
            conn = sqlite3.connect(self.config.db_path)
            c = conn.cursor()

            c.execute("""
                INSERT OR REPLACE INTO game_states
                (char_id, scene, location, timestamp, game_data)
                VALUES (?, ?, ?, ?, ?)
            """, (
                char_id,
                scene,
                location,
                datetime.now().isoformat(),
                json.dumps(game_data) if game_data else "{}"
            ))

            conn.commit()
            logger.info(f"Game state saved for character {char_id}.")
        except sqlite3.Error as e:
            logger.error(f"Error saving game state: {e}")
            st.error(f"Error saving game: {str(e)}")
        finally:
            conn.close()

    def load_game_state(self, char_id: str) -> Optional[Dict[str, Any]]:
        """Loads a saved game state from the database."""
        try:
            conn = sqlite3.connect(self.config.db_path)
            c = conn.cursor()

            c.execute("""
                SELECT scene, location, game_data
                FROM game_states
                WHERE char_id = ?
            """, (char_id,))
            result = c.fetchone()

            if result:
                scene, location, game_data_json = result
                game_data = json.loads(
                    game_data_json) if game_data_json else {}

                # Basic data validation
                if not isinstance(scene, str):
                    logger.warning(f"Invalid scene data for char_id {
                                   char_id}. Using default.")
                    scene = "You are standing in a mysterious place."
                if not isinstance(location, str):
                    logger.warning(f"Invalid location data for char_id {
                                   char_id}. Using default.")
                    location = self.config.default_location
                if not isinstance(game_data, dict):
                    logger.warning(f"Invalid game_data for char_id {
                                   char_id}. Using default.")
                    game_data = {}

                return {
                    'scene': scene,
                    'location': location,
                    'game_data': game_data
                }
            else:
                logger.info(f"No game state found for character {char_id}.")
                return None

        except sqlite3.Error as e:
            logger.error(f"Error loading game state: {e}")
            st.error(f"Error loading game: {str(e)}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"Error decoding game data JSON: {e}")
            st.error(f"Error loading game (corrupted save): {str(e)}")
            return None
        finally:
            conn.close()

    def generate_scene_description(self,
                                   character: Dict[str, Any],
                                   location: str,
                                   ai_service: AIServiceInterface) -> str:
        """Generates a scene description using the AI service."""
        prompt = f"""
            {character['name']}, a {character['race']} {character['class_type']}, is in {location}.

            Create a short scene description focusing on:
            *   What they see
            *   What they hear
            *   What they smell

            Imbue the description with mystery. Limit the description to 3 sentences.
            """

        game_state = GameState(
            location=location,
            time=datetime.now(),
            weather=self.config.default_weather,
            environmental_effects=[],
            active_quests=[],
            recent_events=[]
        )

        char_state = Character(
            name=character['name'],
            status={"health": self.config.initial_health,
                    "energy": self.config.initial_energy},
            current_actions=[],
            recent_events=[],
            stats=character['stats'],
            inventory=[]
        )

        return self._safe_generate_response(
            ai_service,
            prompt,
            "You find yourself in a mysterious place...",
            game_state=game_state,
            character=char_state
        )

    def generate_action_response(self,
                                 character: Dict[str, Any],
                                 action: str,
                                 ai_service: AIServiceInterface) -> str:
        """Generates an AI response to a character's action."""
        prompt = f"""
            {character['name']}, a {character['race']} {character['class_type']} with skills in {', '.join(character.get('skills', []))}, attempts to {action}.

            Describe the immediate outcome, focusing on:
            *   Sensory details (what they see, hear, feel).
            *   Any immediate consequences of the action (positive or negative).
            *   If the action would obviously succeed or fail. If it is a testable skill, mention if the character's skill in that area helped or hindered their progress.
            *   Include a skill check if it is relevant to the action.

            Limit the description to 3 sentences.
            The tone should be descriptive and engaging.
            """

        game_state = GameState(
            location="current location",
            time=datetime.now(),
            weather=self.config.default_weather,
            environmental_effects=[],
            active_quests=[],
            recent_events=[]
        )

        char_state = Character(
            name=character['name'],
            status={"health": self.config.initial_health,
                    "energy": self.config.initial_energy},
            current_actions=[action],
            recent_events=[],
            stats=character['stats'],
            inventory=[]
        )

        return self._safe_generate_response(
            ai_service,
            prompt,
            f"You attempt to {action}, but the outcome is unclear...",
            game_state=game_state,
            character=char_state
        )

    def _safe_generate_response(self,
                                ai_service: AIServiceInterface,
                                prompt: str,
                                fallback_message: str,
                                game_state: Optional[GameState] = None,
                                character: Optional[Character] = None) -> str:
        """Safely generates a response from the AI service with error handling and logging."""
        try:
            logger.info(f"Sending prompt to AI service: {prompt}")
            response = ai_service.generate_response(
                prompt, game_state, character)

            if response:
                logger.info("AI service returned a response.")
                return response
            else:
                logger.warning("AI service returned an empty response.")
                return fallback_message
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            st.error(f"AI service error: {str(e)}")
            return f"The world seems unresponsive. {fallback_message}"

    def start_combat(self, char_id: str) -> None:
        """Initializes combat state in the game."""
        game_state = self.load_game_state(char_id)
        if game_state:
            # Access game_data safely
            game_data = game_state.get('game_data', {})
            game_data['combat_state'] = {
                'active': True,
                'round': 1,
                'combatants': []
            }
            self.save_game_state(
                char_id,
                game_state['scene'],
                game_state['location'],
                game_data
            )
        else:
            logger.warning(f"No game state found for character {
                           char_id}, cannot start combat.")
            st.warning(
                "Cannot start combat: No game state found for your character.")

    def add_combatant(self, char_id: str, name: str, initiative: int) -> None:
        """Adds a combatant to the active combat."""
        game_state = self.load_game_state(char_id)
        if game_state and game_state['game_data'].get('combat_state', {}).get('active'):
            combat_state = game_state['game_data']['combat_state']
            combat_state['combatants'].append({
                'name': name,
                'initiative': initiative
            })
            self.save_game_state(
                char_id,
                game_state['scene'],
                game_state['location'],
                game_state['game_data']
            )
        else:
            logger.warning(f"Combat is not active or game state missing for {
                           char_id}, cannot add combatant.")
            st.warning("Cannot add combatant: Combat is not active.")

    def end_combat(self, char_id: str) -> None:
        """Ends the current combat encounter."""
        game_state = self.load_game_state(char_id)
        if game_state:
            # Access game_data safely
            game_data = game_state.get('game_data', {})
            game_data['combat_state'] = {
                'active': False,
                'combatants': []
            }
            self.save_game_state(
                char_id,
                game_state['scene'],
                game_state['location'],
                game_data
            )
        else:
            logger.warning(f"No game state found for character {
                           char_id}, cannot end combat.")
            st.warning(
                "Cannot end combat: No game state found for your character.")

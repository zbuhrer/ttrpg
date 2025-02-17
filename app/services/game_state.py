import streamlit as st
import sqlite3
import json

from datetime import datetime
from typing import Optional, Dict, Any
from .models import GameState, Character


class GameStateManager:
    def __init__(self, db_path: str = 'game_data.db'):
        self.db_path = db_path
        self._init_database()

    def _init_database(self) -> None:
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        # Create game states table
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
        conn.close()

    def save_game_state(self,
                        char_id: str,
                        scene: str,
                        location: str = "Mistwood Tavern",
                        game_data: Dict[str, Any] = None) -> None:
        """Save current game state to database"""
        conn = sqlite3.connect(self.db_path)
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
        conn.close()

    def load_game_state(self, char_id: str) -> Optional[Dict[str, Any]]:
        """Load saved game state from database"""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()

        result = c.execute("""
            SELECT scene, location, game_data
            FROM game_states
            WHERE char_id = ?
        """, (char_id,)).fetchone()

        conn.close()

        if result:
            return {
                'scene': result[0],
                'location': result[1],
                'game_data': json.loads(result[2])
            }
        return None

    def generate_scene_description(self,
                                   character: Dict[str, Any],
                                   location: str,
                                   ai_service: Any) -> str:
        """Generate AI scene description"""
        try:
            prompt = f"""
            Describe a scene where a {character['race']} {character['class_type']}
            named {character['name']} is in {location}.
            Keep it brief but atmospheric, focusing on sensory details.
            """

            # Create minimal GameState for the scene
            game_state = GameState(
                location=location,
                time=datetime.now(),
                weather="clear",
                environmental_effects=[],
                active_quests=[],
                recent_events=[]
            )

            # Create Character state from dictionary
            char_state = Character(
                name=character['name'],
                status={"health": 100, "energy": 100},
                current_actions=[],
                recent_events=[],
                stats=character['stats'],
                inventory=[]
            )

            response = ai_service.generate_response(
                prompt=prompt,
                game_state=game_state,
                character=char_state
            )

            return response.content if response.success else "You find yourself in a mysterious place..."
        except Exception as e:
            st.error(f"Error generating scene: {str(e)}")
            return "The scene slowly comes into focus..."

    def generate_action_response(self,
                                 character: Dict[str, Any],
                                 action: str,
                                 ai_service: Any) -> str:
        """Generate AI response to character actions"""
        try:
            prompt = f"""
            Describe how {character['name']} attempts to {action}.
            Include sensory details and any consequences.
            Keep it under 3 sentences.
            """

            # Create minimal GameState for the action
            game_state = GameState(
                location="current location",
                time=datetime.now(),
                weather="clear",
                environmental_effects=[],
                active_quests=[],
                recent_events=[]
            )

            # Create Character state from dictionary
            char_state = Character(
                name=character['name'],
                status={"health": 100, "energy": 100},
                current_actions=[action],
                recent_events=[],
                stats=character['stats'],
                inventory=[]
            )

            response = ai_service.generate_response(
                prompt=prompt,
                game_state=game_state,
                character=char_state
            )

            return response.content if response.success else f"You attempt to {action}..."
        except Exception as e:
            st.error(f"Error generating action response: {str(e)}")
            return f"You attempt to {action}, but something seems amiss..."

    def start_combat(self, char_id: str) -> None:
        """Initialize combat state in the game"""
        game_state = self.load_game_state(char_id)
        if game_state:
            game_state['game_data']['combat_state'] = {
                'active': True,
                'round': 1,
                'combatants': []
            }
            self.save_game_state(
                char_id,
                game_state['scene'],
                game_state['location'],
                game_state['game_data']
            )

    def add_combatant(self, char_id: str, name: str, initiative: int) -> None:
        """Add a combatant to the active combat"""
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

    def end_combat(self, char_id: str) -> None:
        """End the current combat encounter"""
        game_state = self.load_game_state(char_id)
        if game_state:
            game_state['game_data']['combat_state'] = {
                'active': False,
                'combatants': []
            }
            self.save_game_state(
                char_id,
                game_state['scene'],
                game_state['location'],
                game_state['game_data']
            )

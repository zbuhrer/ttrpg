import streamlit as st
import sqlite3
import json

from datetime import datetime
from typing import Optional, Dict, Any, List
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

    def create_new_game(self, character: Dict[str, Any], ai_service: Any) -> Dict[str, Any]:
        """Create a personalized game state based on character details"""
        # Safely get personality traits
        traits = character.get('personality', {}).get('traits', [])
        trait_description = f"with {traits[0]} tendencies" if traits else ""

        # Safely get background details
        background_details = character.get('background_details', {})
        origin = background_details.get('origin', 'unknown origins')
        profession = background_details.get('profession', 'mysterious past')
        motivation = background_details.get('motivation', 'seeking adventure')

        # Generate weather based on character background
        weather_prompt = f"""
        Based on {character['name']}'s background as a {character['background']} from
        {origin}, {f"and their {
            ', '.join(traits)} personality" if traits else ""},
        describe the weather for their first adventure. Keep it brief but atmospheric.
        """
        weather_response = ai_service.generate_response(weather_prompt)

        # Generate starting inventory based on background
        inventory_prompt = f"""
        Given {character['name']}'s previous profession as a {profession}
        and their {character['class_type']} class, list 5 specific items they would carry.
        Include one unique or personalized item that reflects their background.
        """
        inventory_response = ai_service.generate_response(inventory_prompt)

        # Generate initial scene description
        scene_prompt = f"""
        Describe the scene where {character['name']}, a {character['race']} {character['class_type']}
        {trait_description}, begins their adventure in the Mistwood Tavern.
        Consider their background as a {profession} and their motivation: {motivation}.
        """
        scene_response = ai_service.generate_response(scene_prompt)

        # Create initial game state with generated content
        initial_state = {
            'scene': scene_response,
            'location': "Mistwood Tavern",
            'game_data': {
                'time': datetime.now().isoformat(),
                'weather': weather_response,
                'environmental_effects': self._generate_environmental_effects(weather_response),
                'active_quests': ['The Call to Adventure'],
                'recent_events': ['Arrived at Mistwood Tavern'],
                'character_state': {
                    'status': {
                        'health': 100,
                        'energy': 100,
                        'rested': True
                    },
                    'inventory': self._parse_inventory(inventory_response)
                }
            }
        }

        # Save state and return
        self.save_game_state(
            char_id=character['id'],
            scene=initial_state['scene'],
            location=initial_state['location'],
            game_data=initial_state['game_data']
        )

        return initial_state

    def _generate_environmental_effects(self, weather_text: str) -> List[str]:
        """Generate environmental effects based on weather description"""
        effects = ['Tavern ambiance', 'Warm hearth']  # Default effects

        # Simple weather keyword mapping
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
        """Parse inventory text into structured format"""
        inventory_items = []

        # Split the text into lines and process each item
        for line in inventory_text.split('\n'):
            line = line.strip()
            if line:
                # Remove any bullet points or numbers
                line = line.lstrip('•-*1234567890. ')

                # Default quantity is 1 unless specified
                quantity = 1

                # Check if quantity is specified in parentheses
                if '(' in line and ')' in line:
                    item_parts = line.split('(')
                    item_name = item_parts[0].strip()
                    try:
                        quantity = int(
                            ''.join(filter(str.isdigit, item_parts[1])))
                    except ValueError:
                        quantity = 1
                else:
                    item_name = line

                inventory_items.append({
                    'item': item_name,
                    'quantity': quantity
                })

        # Ensure we have at least some basic items
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
                        location: str = "Mistwood Tavern",
                        game_data: Dict[str, Any] = None) -> None:
        """Save current game state to database"""
        try:
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
        except Exception as e:
            st.error(f"Error saving game state: {str(e)}")
        finally:
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

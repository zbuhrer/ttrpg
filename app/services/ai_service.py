from dataclasses import dataclass
from typing import Optional, Dict, List, Any
import requests
from pathlib import Path
import faiss
from datetime import datetime
import streamlit as st


@dataclass
class GameState:
    """Represents the current state of the game."""
    location: str
    time: datetime
    weather: str
    environmental_effects: List[str]
    active_quests: List[str]
    recent_events: List[Dict[str, Any]]


@dataclass
class Character:
    """Represents a character's current state."""
    name: str
    status: Dict[str, Any]
    current_actions: List[str]
    recent_events: List[str]
    stats: Dict[str, int]
    inventory: List[Dict[str, Any]]


@dataclass
class AIResponse:
    """Structured response from the AI model."""
    content: str
    success: bool
    response_type: str  # scene, action, dialogue, etc.
    confidence_score: float
    metadata: Dict[str, Any]
    error: Optional[str] = None


class ResponseParser:
    """Handles parsing and validation of AI responses."""

    def __init__(self):
        self.valid_response_types = [
            'scene', 'action', 'dialogue', 'description']

    def parse_response(self, raw_response: Dict[str, Any]) -> AIResponse:
        """Parse raw AI response into structured format."""
        try:
            content = raw_response.get('response', '')

            # Basic content validation
            if not content.strip():
                raise ValueError("Empty response received")

            # Analyze response type based on content
            response_type = self._determine_response_type(content)

            # Calculate confidence score based on response characteristics
            confidence_score = self._calculate_confidence(content)

            return AIResponse(
                content=content,
                success=True,
                response_type=response_type,
                confidence_score=confidence_score,
                metadata={
                    'model': raw_response.get('model'),
                    'total_duration': raw_response.get('total_duration'),
                    'timestamp': datetime.now().isoformat()
                }
            )
        except Exception as e:
            return AIResponse(
                content="",
                success=False,
                response_type="error",
                confidence_score=0.0,
                metadata={},
                error=str(e)
            )

    def _determine_response_type(self, content: str) -> str:
        # TODO: Implement response type detection logic
        return "scene"

    def _calculate_confidence(self, content: str) -> float:
        # TODO: Implement confidence scoring logic
        return 0.8


class ContextManager:
    """Manages conversation history and knowledge retrieval."""

    def __init__(self, knowledge_base_path: Path):
        self.knowledge_base_path = knowledge_base_path
        self.conversation_history: List[Dict[str, Any]] = []
        self.max_history_length = 10
        # Initialize vector database
        self._init_vector_db()

    def _init_vector_db(self):
        """Initialize FAISS vector database."""
        # TODO: Implement vector DB initialization
        self.dimension = 384  # Example dimension for embeddings
        self.index = faiss.IndexFlatL2(self.dimension)

    def add_to_history(self, interaction: Dict[str, Any]):
        """Add new interaction to conversation history."""
        self.conversation_history.append(interaction)
        if len(self.conversation_history) > self.max_history_length:
            self.conversation_history.pop(0)

    def get_relevant_context(self, query: str) -> Dict[str, Any]:
        """Retrieve relevant context for current interaction."""
        # TODO: Implement context retrieval logic
        return {
            'lore': self._get_relevant_lore(query),
            'rules': self._get_relevant_rules(query),
            'history': self.conversation_history[-3:]  # Last 3 interactions
        }

    def _get_relevant_lore(self, query: str) -> List[str]:
        # TODO: Implement lore retrieval
        return []

    def _get_relevant_rules(self, query: str) -> List[str]:
        # TODO: Implement rules retrieval
        return []


class AIService:
    """Main service for handling AI interactions."""

    def __init__(self, endpoint: str, knowledge_base_path: Path):
        self.endpoint = endpoint
        self.parser = ResponseParser()
        self.context_manager = ContextManager(knowledge_base_path)

    def generate_response(self,
                          prompt: str,
                          game_state: Optional[GameState] = None,
                          character: Optional[Character] = None,
                          temperature: float = 0.7) -> str:
        """Generate AI response with full context and parsing."""
        try:
            # Get relevant context
            context = self.context_manager.get_relevant_context(prompt)

            # Construct full prompt
            full_prompt = self._construct_prompt(
                prompt=prompt,
                game_state=game_state,
                character=character,
                context=context
            )

            # Make API call
            payload = {
                "model": "dolphin-phi",
                "prompt": full_prompt,
                "temperature": temperature,
                "stream": False
            }

            response = requests.post(self.endpoint, json=payload)
            response.raise_for_status()

            # Parse the response and get the content
            parsed_response = self.parser.parse_response(response.json())

            if parsed_response.success:
                self.context_manager.add_to_history({
                    'prompt': prompt,
                    'response': parsed_response.content,
                    'metadata': parsed_response.metadata
                })
                return parsed_response.content

            return "The winds of fate are mysterious..."

        except Exception as e:
            st.error(f"Error generating response: {str(e)}")
            return "Something mysterious occurs..."

    def _construct_prompt(self,
                          prompt: str,
                          game_state: GameState,
                          character: Character,
                          context: Dict[str, Any]) -> str:
        """Construct full prompt with all necessary context."""
        return f"""
[Current Game State]
Location: {game_state.location if game_state else 'Unknown'}
Time: {game_state.time if game_state else 'Unknown'}
Weather: {game_state.weather if game_state else 'Unknown'}
Environmental Effects: {', '.join(game_state.environmental_effects) if game_state else 'None'}

[Character State]
Name: {character.name if character else 'Unknown'}
Status: {character.status if character else {}}
Current Actions: {', '.join(character.current_actions) if character else []}
Recent Events: {', '.join(character.recent_events) if character else []}

[Scene Context]
Relevant Lore: {' '.join(context['lore'])}
Relevant Rules: {' '.join(context['rules'])}
Recent History: {self._format_history(context['history'])}

[Request]
{prompt}

Generate a response that:
1. Maintains consistency with established facts
2. Respects game rules and mechanics
3. Provides clear player agency
4. Advances the narrative naturally
"""

    def _format_history(self, history: List[Dict[str, Any]]) -> str:
        """Format conversation history for prompt inclusion."""
        return "\n".join([
            f"- {h['prompt']} -> {h['response']}"
            for h in history
        ])

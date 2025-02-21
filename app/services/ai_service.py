import logging
from dataclasses import dataclass
from typing import Optional, Dict, List, Any
import requests
from pathlib import Path
from datetime import datetime
import streamlit as st
import faiss
from sentence_transformers import SentenceTransformer
import torch  # Import torch
import numpy as np  # Import numpy


# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


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
    xp: int  # Experience point award
    error: Optional[str] = None


class ResponseParser:
    """Handles parsing and validation of AI responses."""

    def __init__(self):
        self.valid_response_types = [
            'scene', 'action', 'dialogue', 'description']

    def parse_response(self, raw_response: str) -> AIResponse:
        """Parse raw AI response into structured format."""
        try:
            content = raw_response.strip()

            # Basic content validation
            if not content.strip():
                raise ValueError("Empty response received")

            # Analyze response type based on content
            response_type = self._determine_response_type(content)

            # Calculate confidence score based on response characteristics
            confidence_score = self._calculate_confidence(content)

            # Determine success.  If 'success' is not passed, default to true.
            success = True

            # Determine xp.  If 'xp' is not passed, default to zero.
            xp = 0

            return AIResponse(
                content=content,
                success=success,
                response_type=response_type,
                confidence_score=confidence_score,
                metadata={
                    'model': "dolphin-phi",
                    'total_duration': 0,
                    'timestamp': datetime.now().isoformat()
                },
                xp=xp
            )
        except Exception as e:
            return AIResponse(
                content="",
                success=False,
                response_type="error",
                confidence_score=0.0,
                metadata={},
                xp=0,
                error=str(e)
            )

    def _determine_response_type(self, content: str) -> str:
        """Determine response type based on content."""
        content_lower = content.lower()
        if content_lower.startswith("[scene]"):
            return "scene"
        elif content_lower.startswith("[action]"):
            return "action"
        # Simple dialogue check
        elif ":" in content and len(content.split(":")[0]) < 20:
            return "dialogue"
        else:
            return "description"

    def _calculate_confidence(self, content: str) -> float:
        """Calculate confidence score based on response characteristics."""
        length = len(content)
        # Longer responses are generally more confident
        return min(length / 500.0, 1.0)  # Scale to a max of 1.0


class ContextManager:
    """Manages conversation history and knowledge retrieval."""

    def __init__(self, knowledge_base_path: Path):
        self.knowledge_base_path = knowledge_base_path
        self.conversation_history: List[Dict[str, Any]] = []
        self.max_history_length = 10
        self.embedding_model_name = "all-MiniLM-L6-v2"  # Fast and decent quality

        torch.set_num_threads(1)  # Disable multithreading

        self.embedding_model = SentenceTransformer(self.embedding_model_name)
        self.dimension = self.embedding_model.get_sentence_embedding_dimension()
        self.index = None
        # Initialize vector database
        self._init_vector_db()

    def _init_vector_db(self):
        """Initialize FAISS vector database."""
        try:
            # Load knowledge base content (replace with your actual data)
            self.knowledge_base = self._load_knowledge_base()

            # Create FAISS index
            self.index = faiss.IndexFlatL2(self.dimension)

            # Generate embeddings and add to index
            if self.knowledge_base:
                self._build_index()
            else:
                logger.warning(
                    "Knowledge base is empty. FAISS index not built.")

            logger.info("FAISS vector database initialized.")

        except Exception as e:
            logger.error(f"Error initializing FAISS database: {e}")
            st.error(f"Error initializing knowledge base: {e}")

    def _load_knowledge_base(self) -> List[Dict[str, str]]:
        """Load knowledge base content from files or database."""
        knowledge_base = []
        for file_path in self.knowledge_base_path.glob("*"):  # Read all files
            try:
                with open(file_path, "r") as f:
                    content = f.read()
                    knowledge_base.append({
                        "type": "lore",  # Or "rule", etc.
                        "content": content,
                        "source": str(file_path)
                    })
            except Exception as e:
                logger.warning(f"Could not read knowledge file {
                               file_path}: {e}")

    def _build_index(self):
        """Build FAISS index from knowledge base."""
        # Generate embeddings
        embeddings = []
        batch_size = 32  # Adjust this value
        for i in range(0, len(self.knowledge_base), batch_size):
            batch = self.knowledge_base[i:i + batch_size]
            batch_embeddings = self.embedding_model.encode(
                [item['content'] for item in batch], batch_size=batch_size
            )
            embeddings.extend(batch_embeddings)

        # Convert to numpy array
        embeddings = [emb.astype('float32') for emb in embeddings]
        embeddings = np.array(embeddings)

        # Add to FAISS index
        self.index.add(embeddings)

        logger.info(f"Added {len(self.knowledge_base)} items to FAISS index.")

    def add_to_history(self, interaction: Dict[str, Any]):
        """Add new interaction to conversation history."""
        self.conversation_history.append(interaction)
        if len(self.conversation_history) > self.max_history_length:
            self.conversation_history.pop(0)

    def get_relevant_context(self, query: str) -> Dict[str, Any]:
        """Retrieve relevant context for current interaction."""
        lore = self._get_relevant_lore(query)
        rules = self._get_relevant_rules(query)
        return {
            'lore': lore,
            'rules': rules,
            'history': self.conversation_history[-3:]  # Last 3 interactions
        }

    def _get_relevant_lore(self, query: str) -> List[str]:
        """Retrieve relevant lore from the knowledge base."""
        return self._search_knowledge_base(query, "lore")

    def _get_relevant_rules(self, query: str) -> List[str]:
        """Retrieve relevant rules from the knowledge base."""
        return self._search_knowledge_base(query, "rule")

    def _search_knowledge_base(self, query: str, content_type: str) -> List[str]:
        """Search the FAISS index for relevant knowledge."""
        if self.index is None or self.knowledge_base is None:
            logger.warning(
                "FAISS index or knowledge base not initialized. Returning empty context.")
            return []

        try:
            # Generate embedding for the query
            query_embedding = self.embedding_model.encode(query)
            query_embedding = query_embedding.astype('float32').reshape(1, -1)

            # Search the FAISS index
            k = min(5, len(self.knowledge_base))  # Limit to top 5 results
            distances, indices = self.index.search(query_embedding, k)

            # Retrieve the content from the knowledge base
            relevant_content = [
                self.knowledge_base[i]['content']
                for i in indices[0] if i < len(self.knowledge_base)
                and self.knowledge_base[i]['type'] == content_type
            ]

            return relevant_content

        except Exception as e:
            logger.error(f"Error searching knowledge base: {e}")
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
                          temperature: float = 0.7) -> AIResponse:
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
            parsed_response = self.parser.parse_response(
                response.json()['response'])

            if parsed_response.success:
                self.context_manager.add_to_history({
                    'prompt': prompt,
                    'response': parsed_response.content,
                    'metadata': parsed_response.metadata
                })
                return parsed_response

            return AIResponse(
                content="The winds of fate are mysterious...",
                success=False,
                response_type='error',
                confidence_score=0.0,
                metadata={},
                xp=0
            )

        except Exception as e:
            st.error(f"Error generating response: {str(e)}")
            return AIResponse(
                content="Something mysterious occurs...",
                success=False,
                response_type='error',
                confidence_score=0.0,
                metadata={},
                xp=0,
                error=str(e)
            )

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
5. Ends the scene with a call to action, so that the player can take the next step in the story.
"""

    def _format_history(self, history: List[Dict[str, Any]]) -> str:
        """Format conversation history for prompt inclusion."""
        return "\n".join([
            f"- {h['prompt']} -> {h['response']}"
            for h in history
        ])

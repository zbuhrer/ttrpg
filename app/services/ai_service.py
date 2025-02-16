from dataclasses import dataclass
from typing import Optional, Dict, List
import requests
from requests.exceptions import RequestException
import json


@dataclass
class AIResponse:
    content: str
    success: bool
    error: Optional[str] = None
    metadata: Optional[Dict] = None


class AIService:
    def __init__(self, endpoint: str):
        self.endpoint = endpoint
        self.default_context = """You are the Game Master of a fantasy RPG.
        Generate engaging, consistent narrative responses that advance the story
        while maintaining game balance and player agency."""

    def generate_response(self,
                          prompt: str,
                          context: Optional[str] = None,
                          temperature: float = 0.7) -> AIResponse:
        """Generate AI response with error handling"""
        try:
            payload = {
                "model": "qwen2.5:latest",  # or whatever model you're using
                "prompt": f"{context or self.default_context}\n\n{prompt}",
                "temperature": temperature,
                "stream": False
            }

            response = requests.post(self.endpoint, json=payload)
            response.raise_for_status()

            result = response.json()
            return AIResponse(
                content=result.get('response', ''),
                success=True,
                metadata={
                    "model": result.get('model'),
                    "total_duration": result.get('total_duration')
                }
            )

        except RequestException as e:
            return AIResponse(
                content="",
                success=False,
                error=f"Connection error: {str(e)}"
            )
        except Exception as e:
            return AIResponse(
                content="",
                success=False,
                error=f"Error generating response: {str(e)}"
            )

    def generate_scene(self,
                       character: Dict,
                       current_location: str,
                       previous_events: List[str]) -> AIResponse:
        """Generate a new scene description"""
        prompt = f"""
        Character: {character['name']}, a {character['race']} {character['class_type']}
        Current Location: {current_location}
        Previous Events: {' -> '.join(previous_events)}

        Generate an engaging scene description that:
        1. Sets the atmosphere
        2. Presents clear interactive elements
        3. Suggests possible actions
        4. Maintains consistency with previous events
        """
        return self.generate_response(prompt)

    def process_action(self,
                       action: str,
                       character: Dict,
                       current_scene: str,
                       previous_actions: List[str]) -> AIResponse:
        """Process player action and generate outcome"""
        prompt = f"""
        Character: {character['name']}, a {character['race']} {character['class_type']}
        Current Scene: {current_scene}
        Player Action: {action}
        Previous Actions: {' -> '.join(previous_actions)}

        Generate a response that:
        1. Describes the outcome of the action
        2. Updates the scene accordingly
        3. Maintains game balance
        4. Provides new opportunities for interaction
        """
        return self.generate_response(prompt)

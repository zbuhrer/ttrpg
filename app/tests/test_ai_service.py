from datetime import datetime
from pathlib import Path
from app.services.ai_service import AIService, GameState, Character


def test_ai_response():
    # Initialize service
    service = AIService(
        endpoint="http://localhost:11434/api/generate",
        knowledge_base_path=Path("data/knowledge_base")
    )

    # Create test game state
    game_state = GameState(
        location="Moonhaven Tavern",
        time=datetime.now(),
        weather="Clear night",
        environmental_effects=["Candlelit", "Bustling crowd"],
        active_quests=["Investigate missing merchants"],
        recent_events=[{"type": "arrival", "detail": "Player entered tavern"}]
    )

    # Create test character
    character = Character(
        name="Thalia Swiftshadow",
        status={"health": 100, "mana": 80},
        current_actions=["Observing tavern patrons"],
        recent_events=["Arrived in town", "Heard rumors of missing merchants"],
        stats={"strength": 12, "dexterity": 15, "intelligence": 14},
        inventory=[{"item": "Short sword", "quantity": 1}]
    )

    # Test prompt
    prompt = "I want to approach the bartender and ask about the missing merchants"

    # Generate response
    response = service.generate_response(
        prompt=prompt,
        game_state=game_state,
        character=character
    )

    print("\n=== AI Response ===")
    print(f"Success: {response.success}")
    print(f"Type: {response.response_type}")
    print(f"Confidence: {response.confidence_score}")
    print("\nContent:")
    print(response.content)
    print("\nMetadata:", response.metadata)

    return response


if __name__ == "__main__":
    test_ai_response()

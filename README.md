# Aetherquill

![Screenshot of the Questing menu](Capture-2025-02-15-190219.png)

## Overview & Current Status

Aehterquill is an AI-driven tabletop RPG system. It writes the story as you engage with the game world, guiding you through quests and adventures. The AI system has been significantly enhanced with improved context management and response structuring capabilities. The implementation now maintains comprehensive conversation history and game state awareness, leading to more contextually appropriate and coherent responses. Response formatting has been standardized to ensure consistent and relevant output for game interactions.

A notable improvement is the implementation of robust game state tracking. The system now maintains detailed environmental and character state information, including location, temporal data, atmospheric conditions, and character activity history. This enhancement provides a foundation for more immersive and contextually aware narrative generation.

Planned improvements include:

1. Active Quest interface refinements:
   - A main story window for the narrative
   - A character status panel with quick-access stats and inventory
   - An interactive action menu with common commands and custom inputs
   - A mini-map or location description widget

2. Style guide implementation:
   - Typography specifications and usage guidelines
   - Color palette standardization
   - Interactive element styling
   - Text formatting conventions for various content types

3. Interface enhancements:
   - Dice rolling visualization for checks and combat
   - Toast notifications for achievements and status updates
   - A collapsible quest log that doesn't take up too much space
   - Ambient sound integration

With the core AI functionality and game state management systems now operational, and the interface framework established, development focus can shift to enhancing user experience and gameplay mechanics.

For more information, consult the [Roadmap](Roadmap.md).

## System Architecture
- Frontend: Streamlit web interface
- Backend: Python-based game engine
- AI: Ollama for narrative generation
- Storage: File-based with JSON serialization

## Component Dependencies
- Core Engine → State Management
- State Management → Save System
- AI Integration → Core Engine
- UI Components → State Management

## Technical Requirements
1. Python 3.8+
2. Streamlit 1.10+
3. Ollama API endpoint
4. Access to file system for saves

## Development Environment
- VS Code with Python extension
- Git for version control
- Virtual environment
- Local Ollama instance

## Data Flow
1. User Interface → Action Handler
2. Action Handler → Game Engine
3. Game Engine → AI Generator
4. AI Generator → State Manager
5. State Manager → User Interface

## API Endpoints
- /api/generate: Ollama story generation
- /api/save: Game state persistence
- /api/load: Game state restoration

## Testing Strategy
1. Unit tests for core logic
2. Integration tests for AI
3. UI tests with Streamlit
4. Save/load verification

## Deployment Strategy
1. Local development setup
2. Containerized testing
3. Production deployment
4. Monitoring implementation

## Performance Requirements
- < 2s response for AI generation
- < 1s for state updates
- < 100ms for UI updates
- < 5s for save/load

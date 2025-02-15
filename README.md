# Project: Echoes of Elysium TTRPG System
## Overview
This project implements an AI-driven tabletop RPG system using Streamlit and Ollama.

## Current Phase: Core Infrastructure

### Phase 1: Core Infrastructure
In our first development phase, we're building the foundation that everything else will stand on. We're starting by organizing all the basic parts of the system and setting up tools to catch problems early. Then we'll create the "memory" of the game - how it keeps track of what's happening and saves that information for later. Finally, we'll build the core engine that makes everything tick, handling turns, actions, and the overall flow of the game. Think of it like building the foundation and frame of a house - not very exciting to look at yet, but absolutely essential to get right.

([Roadmap](Roadmap.md))

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

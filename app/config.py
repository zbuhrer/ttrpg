import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Configuration
OLLAMA_ENDPOINT = os.getenv(
    'OLLAMA_ENDPOINT', 'http://localhost:11434/api/generate')

# Directory Configuration
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
SAVES_DIR = DATA_DIR / "saves"
ASSETS_DIR = DATA_DIR / "assets"

# Ensure directory structure exists
for dir in [DATA_DIR, SAVES_DIR, ASSETS_DIR]:
    dir.mkdir(parents=True, exist_ok=True)

# UI Theme Configuration
THEME = """
    <style>
    /* Custom Theme Elements */
    .stApp {
        background-image: linear-gradient(45deg, #1a1a2e, #16213e);
        color: #e0e0e0;
    }

    .stButton>button {
        background-color: #4a0e0e;
        color: #ffd700;
        border: 2px solid #8b0000;
        border-radius: 5px;
        transition: all 0.3s ease;
    }

    .stButton>button:hover {
        background-color: #8b0000;
        border-color: #ffd700;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    /* Header Styling */
    h1, h2, h3 {
        font-family: 'Cinzel', serif;
        color: #ffd700;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet">
"""

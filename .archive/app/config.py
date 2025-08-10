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

# Page Configuration
PAGE_CONFIG = {
    "page_title": "Aetherquill",
    "layout": "wide",
    "initial_sidebar_state": "collapsed"
}

# UI Theme Configuration
THEME = """
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Alegreya:ital,wght@0,400;0,700;1,400&display=swap');

            /* Base Theme */
            .stApp {
                background: linear-gradient(
                    45deg,
                    #2B2D42 0%, /* Deep Indigo */
                    #1a1a2e 100%
                );
                background-attachment: fixed;
                color: #e0e0e0;
                font-family: 'Alegreya', serif;
            }

            /* Typography */
            h1, h2, h3 {
                font-family: 'Cinzel Decorative', serif;
                color: #D4AF37; /* Runic Gold */
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                margin-bottom: 1.5rem;
            }

            h1 {
                font-weight: 700;
            }

            .narrative-text {
                font-family: 'Alegreya', serif;
                font-style: italic;
                line-height: 1.6;
            }

            /* Button Styling */
            .stButton>button {
                background-color: #519CA6; /* Aether Teal */
                color: white;
                border: 2px solid #D4AF37; /* Runic Gold */
                border-radius: 8px;
                padding: 10px 16px;
                font-family: 'Quattrocento Sans', sans-serif;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .stButton>button:hover {
                background-color: #D4AF37; /* Runic Gold */
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
            }

            .stButton>button:hover::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: linear-gradient(
                    45deg,
                    transparent,
                    rgba(255,255,255,0.1),
                    transparent
                );
                animation: shimmer 1.5s infinite;
            }

            /* Decorative Elements */
            .sidebar .sidebar-content {
                background: linear-gradient(
                    180deg,
                    rgba(43, 45, 66, 0.95),
                    rgba(81, 156, 166, 0.1)
                );
                border-right: 1px solid rgba(212, 175, 55, 0.2);
            }

            /* Input Fields */
            .stTextInput>div>div>input {
                background-color: rgba(43, 45, 66, 0.7);
                border: 1px solid #519CA6;
                border-radius: 4px;
                color: white;
                padding: 8px 12px;
            }

            .stTextInput>div>div>input:focus {
                border-color: #D4AF37;
                box-shadow: 0 0 8px rgba(212, 175, 55, 0.3);
            }

            /* Animations */
            @keyframes shimmer {
                0% { transform: translate(-100%, -100%) rotate(45deg); }
                100% { transform: translate(100%, 100%) rotate(45deg); }
            }

            /* Special Text Elements */
            .quote-text {
                font-family: 'Great Vibes', cursive;
                color: #D4AF37;
                font-size: 1.5em;
                line-height: 1.6;
                margin: 1.5rem 0;
                text-align: center;
            }

            /* Dividers */
            hr {
                border: 0;
                height: 1px;
                background: linear-gradient(
                    90deg,
                    transparent,
                    #D4AF37,
                    transparent
                );
                margin: 2rem 0;
            }

            /* Combat Specific Styling */
            .combat-log {
                background-color: rgba(0, 0, 0, 0.2);
                border-radius: 5px;
                padding: 10px;
                max-height: 200px;
                overflow-y: auto;
            }

            .combatant-card {
                background: linear-gradient(45deg, #2B2D42 0%, #1a1a2e 100%);
                border: 1px solid #D4AF37;
                border-radius: 5px;
                padding: 10px;
                margin: 5px 0;
            }

            .health-bar {
                background-color: #45aa3a;
                height: 10px;
                border-radius: 5px;
                transition: width 0.3s ease;
            }

            .initiative-marker {
                color: #D4AF37;
                font-weight: bold;
            }

            /* Hero Section */
            .hero-section {
                text-align: center;
                padding: 2rem 0;
                margin-bottom: 2rem;
                background: linear-gradient(
                    rgba(43, 45, 66, 0.9),
                    rgba(81, 156, 166, 0.1)
                );
                border-radius: 10px;
                border: 1px solid rgba(212, 175, 55, 0.2);
            }

            .hero-section h1 {
                font-size: 3.5rem;
                margin-bottom: 0.5rem;
            }

            .hero-section h3 {
                font-size: 1.5rem;
                color: #e0e0e0;
                font-weight: normal;
            }

            /* Quick Action Buttons */
            .stButton>button.quick-action {
                width: 100%;
                padding: 1rem;
                margin: 0.5rem 0;
                background-color: rgba(81, 156, 166, 0.2);
            }

            /* Footer */
            .footer {
                text-align: center;
                padding: 1rem 0;
                color: #888;
                font-size: 0.9rem;
            }

            /* Status Indicators */
            .status-indicator {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                margin-right: 5px;
            }

            .status-active {
                background-color: #45aa3a;
            }

            .status-inactive {
                background-color: #aa3a3a;
            }

            </style>
"""

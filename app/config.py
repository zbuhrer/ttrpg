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
            /* Base Theme */
            .stApp {
                background: linear-gradient(
                    45deg,
                    #2B2D42 0%, /* Deep Indigo */
                    #1a1a2e 100%
                );
                background-attachment: fixed;
                color: #e0e0e0;
                font-family: 'Quattrocento Sans', Arial, sans-serif;
            }

            /* Typography */
            h1, h2, h3 {
                font-family: 'Cinzel', Times New Roman, serif;
                color: #D4AF37; /* Runic Gold */
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                margin-bottom: 1.5rem;
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

            </style>
"""

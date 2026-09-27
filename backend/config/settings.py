"""
Application settings loaded from environment variables.
"""

import os

from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET_KEY = (
    os.getenv("SUPABASE_SECRET_KEY")
    or ""
)
SUPABASE_PUBLISHABLE_KEY = (
    os.getenv("SUPABASE_PUBLISHABLE_KEY") or ""
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or ""
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or ""
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY") or ""

# PRODUCTION | STAGE | LOCAL
DEPLOYMENT_ENV = os.getenv("DEPLOYMENT_ENV", "LOCAL")
LOGGING_LEVEL = os.getenv("LOGGING_LEVEL", "INFO")
# TRUE runs Supabase and AI provider connectivity checks once on startup.
PING = os.getenv("PING", "FALSE").strip().upper() == "TRUE"

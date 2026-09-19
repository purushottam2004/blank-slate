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

# PRODUCTION | STAGE | LOCAL
DEPLOYMENT_ENV = os.getenv("DEPLOYMENT_ENV", "LOCAL")
LOGGING_LEVEL = os.getenv("LOGGING_LEVEL", "INFO")

"""Fixtures for backend integration tests against local Supabase."""

from __future__ import annotations

import os

import pytest
from dotenv import load_dotenv
from supabase import create_client


@pytest.fixture
def supabase_env() -> dict[str, str]:
    """Local Supabase URL and keys, or skip when the database is not up."""
    load_dotenv()
    url = os.getenv("SUPABASE_URL", "")
    publishable = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
    secret = os.getenv("SUPABASE_SECRET_KEY", "")
    missing = [
        name
        for name, value in (
            ("SUPABASE_URL", url),
            ("SUPABASE_PUBLISHABLE_KEY", publishable),
            ("SUPABASE_SECRET_KEY", secret),
        )
        if not value
    ]
    if missing:
        pytest.skip("Missing env vars: " + ", ".join(missing))

    try:
        admin = create_client(url, secret)
        admin.table("users").select("id").limit(1).execute()
    except Exception as exc:
        pytest.skip(f"local Supabase is not available: {exc}")

    return {"url": url, "publishable": publishable, "secret": secret}

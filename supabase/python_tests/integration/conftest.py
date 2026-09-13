"""Shared helpers for supabase python integration smoke tests."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

from python_seeds.client import get_supabase_admin_client

ROOT = Path(__file__).resolve().parents[2]


def run_script(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, *args],
        cwd=ROOT,
        check=True,
        text=True,
        capture_output=True,
    )


@pytest.fixture
def admin_client():
    try:
        client = get_supabase_admin_client()
        client.auth.admin.list_users()
    except Exception as exc:
        pytest.skip(f"local Supabase is not available: {exc}")
    return client

"""Seed / unseed smoke against a running local Supabase.

Skipped automatically when the stack is down. Wipes public.users via
`unseed.py --all`, then restores committed seed users afterward.
"""

from __future__ import annotations

import pytest

from python_seeds.client import get_auth_user_id_by_email
from python_seeds.data._001_data_users import SEED_USERS
from python_tests.integration.conftest import run_script

pytestmark = pytest.mark.integration


def _auth_and_profile(admin_client, email: str, user_id: str) -> dict:
    auth_id = get_auth_user_id_by_email(admin_client, email)
    assert auth_id == user_id
    profile = (
        admin_client.table("users")
        .select("id, username, display_name")
        .eq("id", user_id)
        .execute()
    )
    assert profile.data, f"missing public.users row for {email}"
    return profile.data[0]


def test_seed_is_idempotent_then_unseed_clears_users(admin_client):
    run_script("seed.py")
    first_ids = {}
    for user in SEED_USERS:
        row = _auth_and_profile(admin_client, user["email"], user["id"])
        assert row["username"] == user["profile"]["username"]
        assert row["display_name"] == user["profile"]["display_name"]
        first_ids[user["email"]] = row["id"]

    run_script("seed.py")
    for user in SEED_USERS:
        row = _auth_and_profile(admin_client, user["email"], user["id"])
        assert row["id"] == first_ids[user["email"]]

    try:
        run_script("unseed.py", "--all")
        remaining = admin_client.table("users").select("id").execute().data or []
        assert remaining == []
        for user in SEED_USERS:
            assert get_auth_user_id_by_email(admin_client, user["email"]) is None
    finally:
        run_script("seed.py")

"""Smoke: FastAPI hello against a real Supabase session and public.users.

Credentials match supabase/python_seeds/data/_001_data_users.py and
e2e/tests/helpers/auth.ts.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from supabase import create_client

from app import create_app

TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "password123"
TEST_USER_ID = "00000000-0000-0000-0000-000000000002"
TEST_USERNAME = "test_user"

pytestmark = pytest.mark.usefixtures("supabase_env")


def _access_token(auth_response: object) -> str | None:
    """Read access_token from a supabase-py sign-in response."""
    session = getattr(auth_response, "session", None)
    if session is None and isinstance(auth_response, dict):
        session = auth_response.get("session")
    if session is None:
        return None
    token = getattr(session, "access_token", None)
    if token is None and isinstance(session, dict):
        token = session.get("access_token")
    return token


@pytest.fixture
def api_client():
    """In-process API client. Startup pings run only when PING is TRUE."""
    with TestClient(create_app()) as test_client:
        yield test_client


def test_hello_without_token_is_401(api_client: TestClient) -> None:
    """Unauthenticated /api/v1/hello is rejected."""
    response = api_client.get("/api/v1/hello")
    assert response.status_code == 401


def test_seeded_user_hello_and_public_users_row(
    api_client: TestClient, supabase_env: dict[str, str]
) -> None:
    """Seeded user can call hello, and their profile row is in public.users."""
    anon = create_client(supabase_env["url"], supabase_env["publishable"])
    auth_response = anon.auth.sign_in_with_password(
        {"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
    )
    token = _access_token(auth_response)
    assert token, "seeded user did not receive an access token; run supabase seed.py"

    response = api_client.get(
        "/api/v1/hello",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["message"] == "hello"
    assert payload["authenticated"] is True
    assert payload["user"]["email"] == TEST_USER_EMAIL
    assert payload["user"]["id"] == TEST_USER_ID

    admin = create_client(supabase_env["url"], supabase_env["secret"])
    profile = (
        admin.table("users").select("id, username, display_name").eq("id", TEST_USER_ID).execute()
    )
    assert profile.data, f"missing public.users row for {TEST_USER_EMAIL}"
    row = profile.data[0]
    assert row["id"] == TEST_USER_ID
    assert row["username"] == TEST_USERNAME

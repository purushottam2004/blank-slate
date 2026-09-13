"""Auth users created by _001_seed_users.py.

Emails, password, and profile fields live here. Other seed modules should
import these dicts instead of repeating credentials.
"""

DEFAULT_PASSWORD = "password123"


def _seed_user_uuid(n: int) -> str:
    if not 1 <= n <= 99:
        raise ValueError(f"seed user uuid out of range: {n}")
    return f"00000000-0000-0000-0000-{n:012d}"


SEED_USER_ID = _seed_user_uuid(1)
TEST_USER_ID = _seed_user_uuid(2)


def _auth_user(*, email: str, name: str, user_id: str, username: str) -> dict:
    return {
        "id": user_id,
        "email": email,
        "password": DEFAULT_PASSWORD,
        "user_metadata": {"name": name},
        "profile": {
            "username": username,
            "display_name": name,
        },
    }


SEED_USER = _auth_user(
    email="seed_user@gmail.com",
    name="Seed User",
    user_id=SEED_USER_ID,
    username="seed_user",
)

TEST_USER = _auth_user(
    email="test@example.com",
    name="Test User",
    user_id=TEST_USER_ID,
    username="test_user",
)

SEED_USERS = [
    SEED_USER,
    TEST_USER,
]


def seed_user_emails() -> list[str]:
    return [user["email"] for user in SEED_USERS]

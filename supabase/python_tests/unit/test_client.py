"""Unit tests for python_seeds.client helpers."""

from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from python_seeds import client as seed_client


class TestGetSupabaseAdminClient:
    def test_missing_secret_key_raises(self, monkeypatch):
        monkeypatch.setattr(seed_client, "SUPABASE_SECRET_KEY", "")
        with pytest.raises(ValueError, match="SUPABASE_SECRET_KEY"):
            seed_client.get_supabase_admin_client()

    def test_creates_client(self, monkeypatch):
        monkeypatch.setattr(seed_client, "SUPABASE_URL", "http://127.0.0.1:54321")
        monkeypatch.setattr(seed_client, "SUPABASE_SECRET_KEY", "secret")
        fake = MagicMock(name="admin")
        monkeypatch.setattr(seed_client, "create_client", lambda url, key: fake)

        assert seed_client.get_supabase_admin_client() is fake


class TestUserFieldAndList:
    def test_user_field_dict_and_object(self):
        assert seed_client._user_field({"email": "a@b.com"}, "email") == "a@b.com"
        assert seed_client._user_field(SimpleNamespace(email="a@b.com"), "email") == "a@b.com"
        assert seed_client._user_field(SimpleNamespace(), "email") is None

    def test_list_auth_users_list_response(self):
        supabase = MagicMock()
        supabase.auth.admin.list_users.return_value = [SimpleNamespace(id="1")]
        assert len(seed_client.list_auth_users(supabase)) == 1

    def test_list_auth_users_dict_response(self):
        supabase = MagicMock()
        supabase.auth.admin.list_users.return_value = {"users": [{"id": "1"}]}
        assert seed_client.list_auth_users(supabase) == [{"id": "1"}]

    def test_list_auth_users_object_users_attr(self):
        supabase = MagicMock()
        supabase.auth.admin.list_users.return_value = SimpleNamespace(
            users=[SimpleNamespace(id="1")]
        )
        users = seed_client.list_auth_users(supabase)
        assert len(users) == 1


class TestCreateOrGetAuthUser:
    def test_returns_existing_id(self, capsys):
        supabase = MagicMock()
        supabase.auth.admin.list_users.return_value = [
            SimpleNamespace(id="00000000-0000-0000-0000-000000000001", email="seed_user@gmail.com")
        ]

        user_id = seed_client.create_or_get_auth_user(
            supabase,
            {
                "email": "seed_user@gmail.com",
                "password": "password123",
                "id": "00000000-0000-0000-0000-000000000001",
            },
        )

        assert user_id == "00000000-0000-0000-0000-000000000001"
        supabase.auth.admin.create_user.assert_not_called()
        assert "already exists" in capsys.readouterr().out

    def test_warns_when_existing_id_does_not_match_data_file(self, capsys):
        supabase = MagicMock()
        supabase.auth.admin.list_users.return_value = [
            SimpleNamespace(id="other-id", email="seed_user@gmail.com")
        ]

        user_id = seed_client.create_or_get_auth_user(
            supabase,
            {
                "email": "seed_user@gmail.com",
                "password": "password123",
                "id": "00000000-0000-0000-0000-000000000001",
            },
        )

        assert user_id == "other-id"
        assert "reset + reseed" in capsys.readouterr().out

    def test_creates_user_with_stable_id(self):
        supabase = MagicMock()
        supabase.auth.admin.list_users.return_value = []
        created = SimpleNamespace(id="00000000-0000-0000-0000-000000000001")
        supabase.auth.admin.create_user.return_value = SimpleNamespace(user=created)

        user_id = seed_client.create_or_get_auth_user(
            supabase,
            {
                "email": "seed_user@gmail.com",
                "password": "password123",
                "id": "00000000-0000-0000-0000-000000000001",
                "user_metadata": {"name": "Seed User"},
            },
        )

        assert user_id == "00000000-0000-0000-0000-000000000001"
        supabase.auth.admin.create_user.assert_called_once_with(
            {
                "email": "seed_user@gmail.com",
                "password": "password123",
                "email_confirm": True,
                "user_metadata": {"name": "Seed User"},
                "id": "00000000-0000-0000-0000-000000000001",
            }
        )

    def test_already_registered_then_resolved(self):
        supabase = MagicMock()
        supabase.auth.admin.list_users.side_effect = [
            [],
            [SimpleNamespace(id="resolved-id", email="seed_user@gmail.com")],
        ]
        supabase.auth.admin.create_user.side_effect = Exception("User already been registered")

        user_id = seed_client.create_or_get_auth_user(
            supabase,
            {"email": "seed_user@gmail.com", "password": "password123"},
        )

        assert user_id == "resolved-id"

    def test_already_registered_but_unresolved_raises(self):
        supabase = MagicMock()
        supabase.auth.admin.list_users.return_value = []
        supabase.auth.admin.create_user.side_effect = Exception("already exists")

        with pytest.raises(ValueError, match="could not be resolved"):
            seed_client.create_or_get_auth_user(
                supabase,
                {"email": "seed_user@gmail.com", "password": "password123"},
            )

    def test_other_create_errors_are_reraised(self):
        supabase = MagicMock()
        supabase.auth.admin.list_users.return_value = []
        supabase.auth.admin.create_user.side_effect = RuntimeError("network down")

        with pytest.raises(RuntimeError, match="network down"):
            seed_client.create_or_get_auth_user(
                supabase,
                {"email": "seed_user@gmail.com", "password": "password123"},
            )

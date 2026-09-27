"""
Unit tests for FastAPI app factory.
"""

from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app import create_app


class TestCreateApp:
    def test_creates_fastapi_app_with_expected_routes(self):
        application = create_app()
        paths = set(application.openapi()["paths"])

        assert "/" in paths
        assert "/api/v1/hello" in paths
        assert "/api/v1/health" in paths

    def test_root_handler_message(self):
        application = create_app()
        root = application.openapi()["paths"]["/"]["get"]
        assert root["operationId"] == "read_root__get"


class TestLifespanPings:
    def test_runs_executor_when_ping_is_true(self):
        with (
            patch("app.PING", True),
            patch("app.SUPABASE_URL", "https://example.supabase.co"),
            patch("app.SUPABASE_SECRET_KEY", "secret"),
            patch("app.SUPABASE_PUBLISHABLE_KEY", "publishable"),
            patch("app.GEMINI_API_KEY", "gemini"),
            patch("app.OPENAI_API_KEY", "openai"),
            patch("app.ANTHROPIC_API_KEY", "anthropic"),
            patch("app.PingsExecutor") as executor_cls,
        ):
            executor_cls.return_value.execute = AsyncMock()
            with TestClient(create_app()):
                pass

        executor_cls.assert_called_once_with(
            supabase_url="https://example.supabase.co",
            supabase_secret_key="secret",
            supabase_publishable_key="publishable",
            gemini_api_key="gemini",
            openai_api_key="openai",
            anthropic_api_key="anthropic",
        )
        executor_cls.return_value.execute.assert_awaited_once()

    def test_skips_executor_when_ping_is_false(self):
        with patch("app.PING", False), patch("app.PingsExecutor") as executor_cls:
            with TestClient(create_app()):
                pass

        executor_cls.assert_not_called()

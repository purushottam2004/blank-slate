"""
Unit tests for config.pings helpers (no live network / provider calls).
"""

from unittest.mock import AsyncMock, MagicMock, patch

from config.pings import PingsExecutor
from config.utils import DEFAULT_LITELLM_PING_PROMPT, ping_litellm_api_key, with_retries


def _executor(**overrides) -> PingsExecutor:
    values = {
        "supabase_url": "",
        "supabase_secret_key": "",
        "supabase_publishable_key": "",
        "gemini_api_key": "",
        "openai_api_key": "",
        "anthropic_api_key": "",
    }
    values.update(overrides)
    return PingsExecutor(**values)


class TestWithRetries:
    async def test_returns_on_first_success(self):
        calls = {"n": 0}

        @with_retries(retries=3, initial_delay=0)
        async def ok():
            calls["n"] += 1
            return "done"

        with patch("config.utils.asyncio.sleep") as sleep:
            assert await ok() == "done"

        assert calls["n"] == 1
        sleep.assert_not_called()

    async def test_retries_then_succeeds(self):
        calls = {"n": 0}

        @with_retries(retries=3, initial_delay=0.01)
        async def flaky():
            calls["n"] += 1
            if calls["n"] < 3:
                raise RuntimeError("transient")
            return True

        with patch("config.utils.asyncio.sleep") as sleep:
            assert await flaky() is True

        assert calls["n"] == 3
        assert sleep.call_count == 2

    async def test_returns_false_after_exhausting_retries(self):
        @with_retries(retries=2, initial_delay=0.01)
        async def always_fails():
            raise RuntimeError("nope")

        with patch("config.utils.asyncio.sleep"):
            assert await always_fails() is False


class TestPingLitellmApiKey:
    async def test_missing_key_returns_false(self):
        assert (
            await ping_litellm_api_key(
                api_key="",
                model="test/model",
                provider_name="TestProvider",
            )
            is False
        )

    async def test_successful_completion_returns_true(self):
        response = MagicMock()
        response.choices = [MagicMock()]
        response.choices[0].message.content = "OK from model"

        with patch(
            "config.utils.litellm.acompletion",
            new_callable=AsyncMock,
            return_value=response,
        ) as completion:
            result = await ping_litellm_api_key(
                api_key="sk-test",
                model="test/model",
                provider_name="TestProvider",
            )

        assert result is True
        completion.assert_awaited_once_with(
            model="test/model",
            messages=[{"role": "user", "content": DEFAULT_LITELLM_PING_PROMPT}],
            api_key="sk-test",
        )

    async def test_completion_error_returns_false(self):
        with patch(
            "config.utils.litellm.acompletion",
            new_callable=AsyncMock,
            side_effect=RuntimeError("boom"),
        ):
            result = await ping_litellm_api_key(
                api_key="sk-test",
                model="test/model",
                provider_name="TestProvider",
            )

        assert result is False


class TestPingSupabaseConnection:
    async def test_missing_details_returns_false(self):
        executor = _executor()

        assert await executor.ping_supabase_connection() is False

    async def test_accepted_status_codes_return_true(self):
        executor = _executor(
            supabase_url="https://example.supabase.co",
            supabase_publishable_key="publishable-key",
        )
        response = MagicMock()
        response.status_code = 200

        with patch("config.pings.requests.get", return_value=response) as get:
            assert await executor.ping_supabase_connection() is True

        get.assert_called_once()
        args, kwargs = get.call_args
        assert args[0] == "https://example.supabase.co/rest/v1/"
        assert kwargs["timeout"] == 5
        assert kwargs["headers"]["apikey"] == "publishable-key"


class TestExecute:
    async def test_execute_runs_configured_pings(self):
        executor = _executor(
            supabase_url="https://example.supabase.co",
            supabase_secret_key="secret",
            supabase_publishable_key="publishable",
            gemini_api_key="gemini",
            openai_api_key="openai",
            anthropic_api_key="anthropic",
        )

        with (
            patch.object(executor, "ping_gemini_api_key", new_callable=AsyncMock) as gemini,
            patch.object(executor, "ping_openai_api_key", new_callable=AsyncMock) as openai,
            patch.object(executor, "ping_anthropic_api_key", new_callable=AsyncMock) as anthropic,
            patch.object(executor, "ping_supabase_connection", new_callable=AsyncMock) as connection,
            patch.object(
                executor, "ping_supabase_secret_key", new_callable=AsyncMock
            ) as secret,
        ):
            await executor.execute()

        gemini.assert_awaited_once()
        openai.assert_awaited_once()
        anthropic.assert_awaited_once()
        connection.assert_awaited_once()
        secret.assert_awaited_once()

    async def test_execute_skips_unconfigured_pings(self):
        executor = _executor(gemini_api_key="gemini")

        with (
            patch.object(executor, "ping_gemini_api_key", new_callable=AsyncMock) as gemini,
            patch.object(executor, "ping_openai_api_key", new_callable=AsyncMock) as openai,
            patch.object(executor, "ping_anthropic_api_key", new_callable=AsyncMock) as anthropic,
            patch.object(executor, "ping_supabase_connection", new_callable=AsyncMock) as connection,
            patch.object(
                executor, "ping_supabase_secret_key", new_callable=AsyncMock
            ) as secret,
        ):
            await executor.execute()

        gemini.assert_awaited_once()
        openai.assert_not_called()
        anthropic.assert_not_called()
        connection.assert_not_called()
        secret.assert_not_called()

"""
Module Exposes a function to test if all API and SECURE KEYs are work
All Ping Functions should be inside the class 'PingsExecutor' and should start with 'ping_'
"""

import asyncio
import logging
from dataclasses import dataclass, field

import requests
from supabase import acreate_client

from .utils import env, ping_litellm_api_key, with_retries

logger = logging.getLogger(__name__)


@dataclass
class PingsExecutor:
    """Runs connectivity checks for External Services.
    Services:
    - Supabase
    - Gemini
    - OpenAI
    - Anthropic

    Omitted constructor arguments are read from the environment.
    Secret fields use repr=False so they are left out of repr().
    """

    supabase_url: str = field(default_factory=lambda: env("SUPABASE_URL"))
    supabase_secret_key: str = field(
        default_factory=lambda: env("SUPABASE_SECRET_KEY"),
        repr=False,
    )
    supabase_publishable_key: str = field(
        default_factory=lambda: env("SUPABASE_PUBLISHABLE_KEY"),
        repr=False,
    )
    gemini_api_key: str = field(
        default_factory=lambda: env("GEMINI_API_KEY"),
        repr=False,
    )
    openai_api_key: str = field(
        default_factory=lambda: env("OPENAI_API_KEY"),
        repr=False,
    )
    anthropic_api_key: str = field(
        default_factory=lambda: env("ANTHROPIC_API_KEY"),
        repr=False,
    )

    @with_retries(retries=5)
    async def ping_gemini_api_key(self) -> bool:
        """To Check if Gemini Key works"""
        return await ping_litellm_api_key(
            api_key=self.gemini_api_key,
            model="gemini/gemini-2.5-flash",
            provider_name="Gemini",
        )

    @with_retries(retries=5)
    async def ping_openai_api_key(self) -> bool:
        """To Check if OPENAI API KEY works"""
        return await ping_litellm_api_key(
            api_key=self.openai_api_key,
            model="openai/gpt-4.1-mini",
            provider_name="OpenAI",
        )

    @with_retries(retries=5)
    async def ping_anthropic_api_key(self) -> bool:
        """To Check if Anthropic API KEY works"""
        return await ping_litellm_api_key(
            api_key=self.anthropic_api_key,
            model="anthropic/claude-3-5-sonnet-latest",
            provider_name="Anthropic",
        )

    @with_retries(retries=5)
    async def ping_supabase_connection(self) -> bool:
        """To check if SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY work"""
        if not self.supabase_url or not self.supabase_publishable_key:
            logger.warning(
                "Supabase connection details are not set",
                extra={
                    "status": "failure",
                    "error": "SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY is missing",
                },
            )
            return False

        try:
            headers = {
                "apikey": self.supabase_publishable_key,
                "Authorization": f"Bearer {self.supabase_publishable_key}",
            }

            response = await asyncio.to_thread(
                requests.get,
                f"{self.supabase_url}/rest/v1/",
                headers=headers,
                timeout=5,
            )

            # 401 = key accepted but no resource (EXPECTED)
            if response.status_code in (200, 401, 404):
                logger.info(
                    "Supabase connection check passed",
                    extra={
                        "status": "success",
                        "http_status_code": response.status_code,
                    },
                )
                return True
            raise RuntimeError(f"Unexpected status code: {response.status_code}")

        except Exception as e:
            logger.error(
                "Supabase connection check failed",
                extra={
                    "status": "failure",
                    "error": str(e),
                },
            )
            return False

    @with_retries(retries=5)
    async def ping_supabase_secret_key(self) -> bool:
        """To check if SUPABASE_SECRET_KEY works"""
        if not self.supabase_url or not self.supabase_secret_key:
            logger.warning(
                "Supabase secret key details are not set",
                extra={
                    "status": "failure",
                    "error": "SUPABASE_URL or SUPABASE_SECRET_KEY is missing",
                },
            )
            return False

        try:
            supabase = await acreate_client(self.supabase_url, self.supabase_secret_key)

            # Secret key must bypass RLS
            # This query should succeed even if RLS is enabled
            await supabase.table("users").select("id").limit(1).execute()
            logger.info(
                "Supabase secret key check passed",
                extra={
                    "status": "success",
                },
            )
            return True

        except Exception as e:
            logger.error(
                "Supabase secret key check failed",
                extra={
                    "status": "failure",
                    "error": str(e),
                },
            )
            raise

    async def execute(self) -> None:
        """Run every configured ping_* check once."""
        checks = []
        if self.gemini_api_key:
            checks.append(self.ping_gemini_api_key())
        if self.openai_api_key:
            checks.append(self.ping_openai_api_key())
        if self.anthropic_api_key:
            checks.append(self.ping_anthropic_api_key())
        if self.supabase_url and self.supabase_publishable_key:
            checks.append(self.ping_supabase_connection())
        if self.supabase_url and self.supabase_secret_key:
            checks.append(self.ping_supabase_secret_key())
        if checks:
            await asyncio.gather(*checks)

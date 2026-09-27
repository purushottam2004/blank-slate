# pylint: disable=broad-exception-caught
"""Shared helpers for environment lookup, retries, and LiteLLM checks."""

import asyncio
import functools
import logging
import os

import litellm

logger = logging.getLogger(__name__)

DEFAULT_LITELLM_PING_PROMPT = "Say OK"


def env(name: str) -> str:
    """Return the environment variable value, or an empty string when unset."""
    return os.getenv(name) or ""


def with_retries(retries: int = 5, initial_delay: float = 1.0):
    """Decorator to retry an async function with exponential backoff."""

    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            delay = initial_delay
            last_exc = None
            for attempt in range(retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exc = e
                    if attempt < retries - 1:
                        logger.warning(
                            "Retry attempt failed",
                            extra={
                                "function_name": func.__name__,
                                "attempt": attempt + 1,
                                "max_retries": retries,
                                "error": str(e),
                                "retry_delay_seconds": delay,
                            },
                        )
                        await asyncio.sleep(delay)
                        delay = min(delay * 2, 16.0)
            logger.error(
                "Function failed after all retries",
                extra={
                    "function_name": func.__name__,
                    "max_retries": retries,
                    "final_error": str(last_exc),
                },
            )
            return False

        return wrapper

    return decorator


async def ping_litellm_api_key(*, api_key: str, model: str, provider_name: str) -> bool:
    """Ping a LiteLLM-backed provider using the configured API key."""
    if not api_key:
        logger.warning(
            "%s API key is not set",
            provider_name,
            extra={
                "status": "failure",
                "error": f"{provider_name} API key is missing",
            },
        )
        return False

    try:
        response = await litellm.acompletion(
            model=model,
            messages=[{"role": "user", "content": DEFAULT_LITELLM_PING_PROMPT}],
            api_key=api_key,
        )
        response_preview = (
            response.choices[0].message.content[:10]
            if response.choices and response.choices[0].message.content
            else None
        )
        logger.info(
            "%s API key check passed",
            provider_name,
            extra={
                "status": "success",
                "response_preview": response_preview,
            },
        )
        return True

    except Exception as e:
        logger.error(
            "%s API key check failed",
            provider_name,
            extra={
                "status": "failure",
                "error": str(e),
            },
        )
        return False

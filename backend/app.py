"""
Exposes the function to create the FastAPI application instance. To be used by main.py
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Initialize logging configuration (must be imported before other modules)
from config.logger import setup_logging

setup_logging()

from api.v1.router import router as v1_router
from config.pings import PingsExecutor
from config.settings import (
    ANTHROPIC_API_KEY,
    DEPLOYMENT_ENV,
    GEMINI_API_KEY,
    OPENAI_API_KEY,
    PING,
    SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY,
    SUPABASE_URL,
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run connectivity checks once on startup when PING is TRUE."""
    if PING:
        ping_executor = PingsExecutor(
            supabase_url=SUPABASE_URL,
            supabase_secret_key=SUPABASE_SECRET_KEY,
            supabase_publishable_key=SUPABASE_PUBLISHABLE_KEY,
            gemini_api_key=GEMINI_API_KEY,
            openai_api_key=OPENAI_API_KEY,
            anthropic_api_key=ANTHROPIC_API_KEY,
        )
        await ping_executor.execute()
    yield


def create_app() -> FastAPI:
    """
    The function to create the FastAPI application instance. To be used by main.py
    """
    app = FastAPI(title="My FastAPI Application", lifespan=lifespan)

    # Add CORS middleware BEFORE including routes
    if DEPLOYMENT_ENV == "PRODUCTION":
        app.add_middleware(
            CORSMiddleware,
            allow_origin_regex=r"https://.*\.your_domain\.com",
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        logger.info(
            "CORS configured",
            extra={
                "deployment_env": DEPLOYMENT_ENV,
                "allow_origin_pattern": r"https://.*\.your_domain\.com",
            },
        )
    elif DEPLOYMENT_ENV == "STAGE":
        # Stage mode: allow Vercel previews and your_domain.com
        stage_origin_pattern = r"https://.*\.your_domain\.com" r"|https://.*\.vercel\.app"
        app.add_middleware(
            CORSMiddleware,
            allow_origin_regex=stage_origin_pattern,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        logger.info(
            "CORS configured",
            extra={
                "deployment_env": DEPLOYMENT_ENV,
                "allow_origin_pattern": r"https://.*\.vercel\.app",
            },
        )
    else:
        # Development mode: allow localhost, Vercel previews, and your_domain.com
        dev_origin_pattern = (
            r"http://(localhost|127\.0\.0\.1)(:\d+)?" r"|https://.*\.vercel\.app" r"|https://.*\.your_domain\.com"
        )
        app.add_middleware(
            CORSMiddleware,
            allow_origin_regex=dev_origin_pattern,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        logger.info(
            "CORS configured",
            extra={
                "deployment_env": DEPLOYMENT_ENV,
                "allow_origin_pattern": "localhost, vercel.app, your_domain.com",
            },
        )

    # Include routes AFTER CORS middleware
    app.include_router(v1_router)

    @app.get("/")
    async def read_root():
        return {"message": "Welcome to My FastAPI Application!"}

    return app

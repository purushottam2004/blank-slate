"""
API v1 router with authentication dependency and a sample endpoint.
"""

import logging
from http import HTTPStatus

from fastapi import APIRouter, Depends, Request

from .auth import require_supabase_user

logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/v1",
    # dependencies=[Depends(require_supabase_user)], # Removed global dependency
)


# Intentionally required authentication
@router.get("/hello", dependencies=[Depends(require_supabase_user)])
def hello(request: Request) -> dict:
    """
    A sample endpoint that requires authentication.
    """
    user = getattr(request.state, "supabase_user", None)
    user_id = getattr(user, "id", None) if user is not None else None
    email = getattr(user, "email", None) if user is not None else None

    if isinstance(user, dict):
        user_id = user_id or user.get("id")
        email = email or user.get("email")

    return {
        "message": "hello",
        "authenticated": True,
        "user": {"id": user_id, "email": email},
    }


# Intentionally kept unauthenticated
@router.get("/health")
def health(request: Request) -> HTTPStatus:
    return HTTPStatus.OK

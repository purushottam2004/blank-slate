"""Paths and names for the example public storage seed."""

from pathlib import Path

SEED_ASSETS_BUCKET = "seed_assets"
LOGIN_PHOTO_OBJECT = "login-photo.svg"
LOGIN_PHOTO_CONTENT_TYPE = "image/svg+xml"
LOGIN_PHOTO_PATH = Path(__file__).resolve().parent / "assets" / LOGIN_PHOTO_OBJECT

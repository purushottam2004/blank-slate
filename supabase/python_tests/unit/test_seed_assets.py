"""Unit tests for the example storage seed payload."""

from python_seeds.data._002_data_assets import (
    LOGIN_PHOTO_CONTENT_TYPE,
    LOGIN_PHOTO_OBJECT,
    LOGIN_PHOTO_PATH,
    SEED_ASSETS_BUCKET,
)


def test_login_photo_exists():
    assert SEED_ASSETS_BUCKET == "seed_assets"
    assert LOGIN_PHOTO_OBJECT == "login-photo.svg"
    assert LOGIN_PHOTO_CONTENT_TYPE == "image/svg+xml"
    assert LOGIN_PHOTO_PATH.is_file()
    assert LOGIN_PHOTO_PATH.stat().st_size < 4096
    assert LOGIN_PHOTO_PATH.read_text().startswith("<svg")

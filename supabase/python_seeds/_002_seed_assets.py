"""
Upload the example public photo into the seed_assets bucket.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from python_seeds.client import SUPABASE_URL, get_supabase_admin_client
from python_seeds.data._002_data_assets import (
    LOGIN_PHOTO_CONTENT_TYPE,
    LOGIN_PHOTO_OBJECT,
    LOGIN_PHOTO_PATH,
    SEED_ASSETS_BUCKET,
)


def seed_assets() -> None:
    supabase = get_supabase_admin_client()
    print(f"Connecting to Supabase at: {SUPABASE_URL}")
    print(f"Uploading {LOGIN_PHOTO_OBJECT} to {SEED_ASSETS_BUCKET}...\n")

    if not LOGIN_PHOTO_PATH.is_file():
        raise FileNotFoundError(f"Missing seed photo: {LOGIN_PHOTO_PATH}")

    content = LOGIN_PHOTO_PATH.read_bytes()
    bucket = supabase.storage.from_(SEED_ASSETS_BUCKET)
    try:
        bucket.remove([LOGIN_PHOTO_OBJECT])
    except Exception:
        pass

    bucket.upload(
        LOGIN_PHOTO_OBJECT,
        content,
        {"content-type": LOGIN_PHOTO_CONTENT_TYPE, "upsert": "true"},
    )
    public_url = (
        f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/"
        f"{SEED_ASSETS_BUCKET}/{LOGIN_PHOTO_OBJECT}"
    )
    print(f"  Public URL: {public_url}")
    print("\nSeeding complete!")


if __name__ == "__main__":
    seed_assets()

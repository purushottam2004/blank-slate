"""Smoke the committed hello_world Edge Function.

Skipped when local Supabase is down. The function accepts the secret key on
the apikey header (verify_jwt is off; withSupabase checks the key).
"""

from __future__ import annotations

import json
import urllib.request

import pytest

from python_seeds.client import SUPABASE_SECRET_KEY, SUPABASE_URL

pytestmark = pytest.mark.integration


def test_hello_world_greets_by_name(admin_client):
    del admin_client
    request = urllib.request.Request(
        f"{SUPABASE_URL}/functions/v1/hello_world",
        data=json.dumps({"name": "world"}).encode(),
        headers={
            "apikey": SUPABASE_SECRET_KEY,
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        body = json.loads(response.read().decode())
        status = response.status

    assert status == 200
    assert body == {"message": "Hello world!"}

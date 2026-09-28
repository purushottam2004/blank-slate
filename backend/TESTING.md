# Backend testing

Pytest. Run everything with `uv run` from `backend/` after `uv sync`.

## Suites

| Suite | Needs | Command |
| --- | --- | --- |
| Unit | Nothing except the venv | `uv run pytest tests/unit` |
| Integration | Local Supabase, seeded users, `backend/.env` | `uv run pytest tests/integration` |

`tests/integration/test_hello_smoke.py` signs in as the seeded user, calls `GET /api/v1/hello`, and reads that user's `public.users` row. It skips when Supabase is down.

Quality bar also includes:

```bash
uv run ruff check .
uv run ruff format --check .
```

## What to add

- New route or helper → unit test in `tests/unit/` with mocked Supabase (`tests/unit/test_auth.py` is the pattern).
- Change that must hit Auth or Postgres → integration test. Keep emails/UUIDs in sync with `supabase/python_seeds/data/_001_data_users.py` and `e2e/tests/helpers/auth.ts`.
- Do not put live service keys in tests.

Regenerate public-schema Pydantic models after a migration: `uv run python scripts/generate_schema.py` (needs local Supabase). Models live in `generated/fastapi/` (CLI default filename `schema_public_latest.py` for this template's public schema).

# Supabase Setup Guide

Local Supabase (Postgres + Auth + Studio) for this template.

For the full project flow, see the root [SETUP_GUIDE.md](../SETUP_GUIDE.md).

## Prerequisites

- Docker daemon running
- [uv](https://docs.astral.sh/uv/) 0.12.19
- Python 3.12 (`supabase/.python-version`). `uv sync` installs it if it is missing.
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started)

## Steps

From the [`supabase/`](./) directory:

```bash
# 1. Virtualenv + seed dependencies
uv sync

# 2. Start stack, write .env, seed data
uv run python setup.py
```

`uv sync` creates `supabase/.venv` from `pyproject.toml` and `uv.lock`. Run the Python scripts with `uv run`.

[`setup.py`](./setup.py) will:

1. Start local containers (`supabase start`)
2. Read credentials via `supabase status -o env`
3. Write [`.env`](./.env.example) in this folder (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`)
4. Run [`seed.py`](./seed.py)

### Useful flags

```bash
uv run python setup.py --skip-seed   # start + write .env only
uv run python setup.py --help
```

### SQL vs Python seeds

- **SQL** — files in [`seeds/`](./seeds/) run on `supabase db reset` (`config.toml` `[db.seed]` uses `./seeds/*.sql`).
- **Python** — [`seed.py`](./seed.py) auto-discovers `python_seeds/*.py` whose name **starts with `_`** and **contains `_seed_`**, sorted by filename. Payloads live in `python_seeds/data/_00N_data_*.py`.
  - Committed examples: `_001_seed_users.py`, `_002_seed_assets.py` (public `seed_assets` photo)
  - Local scratch: `_local_seed_experiments.py` (gitignored)

```bash
uv run python seed.py
uv run python python_seeds/_001_seed_users.py   # one script
uv run python unseed.py --all                   # wipe app tables, then seed.py again
```

Default password is `password123` (see `python_seeds/data/_001_data_users.py`). E2E login specs use `test@example.com` / that password.

### Python tests

Tests live under [`python_tests/`](./python_tests/) (not `tests/`, so they stay distinct from SQL).

```bash
uv run pytest python_tests/unit
uv run pytest python_tests/integration   # needs local Supabase; skips if it is down
uv run ruff check .
uv run ruff format --check .
```

### Google and phone auth (optional)

Both stay **disabled** until you turn them on. The shared login page still renders the buttons.

1. **Google** — set `[auth.external.google] enabled = true` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` / `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` (see [`.env.example`](./.env.example)). Add each app origin to `additional_redirect_urls` and to the Google OAuth client (local defaults: `http://127.0.0.1:5173` and `http://127.0.0.1:5174`). The browser calls `signInWithOAuth({ provider: 'google' })`.
2. **Phone OTP** — set `[auth.sms] enabled = true` and enable an SMS provider (`[auth.sms.twilio]` or `test_otp`). The browser calls `signInWithOtp` / `verifyOtp`. Do not commit Twilio tokens. `enabled` turns the phone provider on. New-user signup for the whole project stays on `[auth] enable_signup`.

Unit tests and lint do not need live Google or Twilio credentials.

### Edge Functions

[`functions/hello_world`](./functions/hello_world/index.ts) is a dummy function. After `supabase start` (or `uv run python setup.py`), it is served at `http://127.0.0.1:54321/functions/v1/hello_world`.

The handler accepts the publishable or secret key on the `apikey` header. `[functions.hello_world]` sets `verify_jwt = false` because those keys are not user JWTs; `withSupabase` checks the key. POST a JSON body with `name`:

```bash
curl -i --request POST 'http://127.0.0.1:54321/functions/v1/hello_world' \
  --header "apikey: $SUPABASE_PUBLISHABLE_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"name":"Functions"}'
```

Expected body: `{"message":"Hello Functions!"}`. The first call can be slow while the edge runtime fetches `@supabase/server`.

Create another function from the repo root with `supabase functions new <name>`. That writes `functions/<name>/` and a `[functions.<name>]` block in [`config.toml`](./config.toml). While editing, `supabase functions serve <name>` hot-reloads that function.

`supabase functions new` pastes the current local publishable key into the sample curl in `index.ts`. Replace that value with a placeholder before committing.

### Regenerate types after a migration

```bash
# TypeScript (from frontend/, local Supabase must be running)
pnpm --filter @repo/db run generate

# Pydantic (from backend/)
uv run python scripts/generate_schema.py
```

The login page loads `seed_assets/login-photo.svg` from the public Storage URL (`VITE_SUPABASE_URL` + `/storage/v1/object/public/...`). `python seed.py` uploads it; `unseed.py` removes the object.

## What you get

| Service | Typical local URL |
| --- | --- |
| API | `http://127.0.0.1:54321` |
| Edge Functions | `http://127.0.0.1:54321/functions/v1/hello_world` |
| MCP | `http://127.0.0.1:54321/mcp` |
| Studio | `http://127.0.0.1:54323` |
| DB | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

Use the keys in `.env` when configuring [backend](../backend/SETUP_GUIDE.md) and [frontend](../frontend/SETUP_GUIDE.md). Cursor reads [`../.cursor/mcp.json`](../.cursor/mcp.json); Claude Code reads [`../.mcp.json`](../.mcp.json) at the repo root (`"type": "http"` required).

Contribution rules: [CONTRIBUTING.md](./CONTRIBUTING.md).

# Backend Setup Guide

FastAPI backend for this template.

For the full project flow, see the root [SETUP_GUIDE.md](../SETUP_GUIDE.md). Do [Supabase setup](../supabase/SETUP_GUIDE.md) first.

## Prerequisites

- [uv](https://docs.astral.sh/uv/) 0.12.19 (same release as `backend/uv.lock`)
- Python 3.12 (`backend/.python-version`). `uv sync` installs it if it is missing.
- Local Supabase running (or a remote project)

## Steps

From the [`backend/`](./) directory:

```bash
# 1. Virtualenv + dependencies (includes the dev group: pytest, pylint)
uv sync

# 2. Environment
cp .env.example .env
```

`uv sync` creates `backend/.venv` from `pyproject.toml` and `uv.lock`. Run commands with `uv run` so they use that env. Production images install with `uv sync --frozen --no-dev` and skip the dev group.

### Fill `.env`

Copy local values from [`supabase/.env`](../supabase/.env.example) after running [`supabase/setup.py`](../supabase/setup.py):

| Variable | Source |
| --- | --- |
| `SUPABASE_URL` | `SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | `SUPABASE_PUBLISHABLE_KEY` |
| `SUPABASE_SECRET_KEY` | `SUPABASE_SECRET_KEY` |

Also set:

- `DEPLOYMENT_ENV=LOCAL` for local development (CORS / local behavior)
- Optional: `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- Optional: `LOGGING_LEVEL=INFO`
- `PING=TRUE` to run those connectivity checks once when the API starts. Leave it `FALSE` otherwise.

See [`.env.example`](./.env.example) for the full list.

### Run

```bash
uv run python main.py
```

API listens on [http://127.0.0.1:8080](http://127.0.0.1:8080).

Alternatively:

```bash
uv run uvicorn main:app --host 127.0.0.1 --port 8080
# or with Docker (the image installs deps with uv):
docker compose up
```

## Next

Configure and start the [frontend](../frontend/SETUP_GUIDE.md). Set `VITE_BACKEND_URL` to `http://127.0.0.1:8080`.

Contribution rules: [CONTRIBUTING.md](./CONTRIBUTING.md).

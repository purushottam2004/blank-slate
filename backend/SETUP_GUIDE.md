# Backend Setup Guide

FastAPI backend for this template.

For the full project flow, see the root [SETUP_GUIDE.md](../SETUP_GUIDE.md). Do [Supabase setup](../supabase/SETUP_GUIDE.md) first.

## Prerequisites

- Python ≥ 3.13
- Local Supabase running (or a remote project)

## Steps

From the [`backend/`](./) directory:

```bash
# 1. Virtualenv + dependencies
python -m venv .venv

# macOS / Linux
source .venv/bin/activate
# Windows
# .venv\Scripts\activate

pip install -r requirements.txt
# optional: pip install -r requirements-dev.txt

# 2. Environment
cp .env.example .env
```

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

See [`.env.example`](./.env.example) for the full list.

### Run

```bash
python main.py
```

API listens on [http://127.0.0.1:8080](http://127.0.0.1:8080).

Alternatively:

```bash
uvicorn main:app --host 127.0.0.1 --port 8080
# or with Docker:
docker compose up
```

## Next

Configure and start the [frontend](../frontend/SETUP_GUIDE.md). Set `VITE_BACKEND_URL` to `http://127.0.0.1:8080`.

Contribution rules: [CONTRIBUTING.md](./CONTRIBUTING.md).

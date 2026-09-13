# Contributing to the backend

Repo-wide rules: [../CONTRIBUTING.md](../CONTRIBUTING.md). Setup: [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## Code style

```bash
cd backend
source .venv/bin/activate
pylint .                 # same command CI runs (.github/workflows/pylint.yaml)
```

- **Pylint** — static analysis. Required in CI on `backend/**` changes. Fix new warnings before merging.

## Adding API routes

- Prefer feature modules under `api/v1/` and include them from the v1 router.
- Keep routes behind existing Supabase auth; do not weaken JWT checks.
- If the API is running via **Docker Compose**, restart it after route changes (`docker compose restart`). Compose uvicorn has **no `--reload`** — see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## Tests

```bash
pytest tests/unit -v
pytest tests/integration -v   # needs local Supabase + seeded users + .env
```

Do not hardcode secrets in tests; use env / fixtures.

When changing seed IDs or user fixtures, keep them aligned with:

- `supabase/python_seeds/data/_001_data_users.py`
- `e2e/tests/helpers/auth.ts`

## PRs

- Target the team’s integration branch (usually `stage`).
- Mention how you tested (unit / integration / manual curl).
- Avoid unrelated refactors in the same PR.
